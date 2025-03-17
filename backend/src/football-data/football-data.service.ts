import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { Cache } from 'cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  FootballEvent,
  FootballEvents,
  ServerFootballEvents,
} from './football-data.events';
import type {
  FootballData,
  Match,
  Rounds,
  Standing,
  TeamStanding,
} from '../types/football.types';
import puppeteer, { Browser, Page } from 'puppeteer';
import { Match as MatchEntity } from './model/match.entity';
import { Round as RoundEntity } from './model/round.entity';
import { Repository } from 'typeorm';
import {
  NotificationEvent,
  NotificationEvents,
} from 'src/notification/notification.events';
import { CacheKeys } from './football-data.cache';

const Selectors = {
  roundsBox: 'div.TabPanel[data-panelid="round"]',
  dropDown: 'div.Dropdown',
  dropDownButton: 'button.DropdownButton[role="combobox"]',
  dropDownItems: 'li.DropdownItem',
  events: 'a[data-testid="event_cell"]',
  homeTeamNameBox: 'div[data-testid="left_team"]',
  awayTeamBox: 'div[data-testid="right_team"]',
  homeTeamScoreBox: 'div[data-testid="left_score"]',
  awayTeamScoreBox: 'div[data-testid="right_score"]',
};

@Injectable()
export class FootballDataService implements OnModuleInit, OnModuleDestroy {
  private superligaURL =
    'https://www.sofascore.ro/tournament/football/romania/superliga/152';

  private roundURL =
    'https://www.sofascore.com/api/v1/unique-tournament/152/season/62837/rounds';

  private browser: Browser;

  private page: Page;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject('ROUND_REPOSITORY')
    private roundRepository: Repository<RoundEntity>,
    @Inject('MATCH_REPOSITORY')
    private matchRepository: Repository<MatchEntity>,
    private eventEmitter: EventEmitter2,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async onModuleInit() {
    await this.clearCache();
    await this.initScraper();
    await this.scrapeAndSaveRounds();
    await this.fetchAndCacheStanding();
    await this.fetchAndCacheCurrentRound();
    await this.initLiveEvents();

    // this.eventEmitter.emit(FootballEvents.LIVE_MATCH_ADDED, {
    //   eventId: 12489689,
    // } as MatchEntity);
    // await this.addDemoJob();
  }

  private async scrapeRoundMatches() {
    const roundMatches: Match[] = await this.page.$$eval(
      Selectors.events,
      (events) =>
        events.map((event) => {
          const eventId = parseInt(event.getAttribute('data-id')) ?? -1;
          const innerDiv = event.querySelector('div.Box.Flex');
          const childDivs = innerDiv?.querySelectorAll('div.Box');
          const dateDiv = childDivs[1];
          const dateTexts = dateDiv?.querySelectorAll('bdi');
          const timeDate = dateTexts[0]?.textContent ?? '';
          const matchStatus = dateTexts[1]?.textContent ?? ''; // can be 45+ or 12' or HT or FT etc...
          const matchDiv = childDivs[4];
          const matchBox = matchDiv?.querySelector("div[display='flex']");
          const matchBoxes = matchBox?.querySelectorAll('div.Box');
          const teamsBox = matchBoxes[0];
          const teamImages = teamsBox?.querySelectorAll('img');
          const homeTeamImage = teamImages[0]?.getAttribute('src') ?? '';
          const awayTeamImage = teamImages[1]?.getAttribute('src') ?? '';
          const homeTeamNameBox = teamsBox?.querySelector(
            'div[data-testid="left_team"]',
          );
          const homeTeamNameBdi = homeTeamNameBox?.querySelector('bdi');

          // if the name is abcx2 remove everyting after x, including x
          const homeTeamName =
            homeTeamNameBdi?.textContent.replace(/x.*$/, '') ?? '';
          const awayTeamNameBox = teamsBox?.querySelector(
            'div[data-testid="right_team"]',
          );
          const awayTeamNameBdi = awayTeamNameBox?.querySelector('bdi');
          const awayTeamName =
            awayTeamNameBdi?.textContent.replace(/x.*$/, '') ?? '';
          const homeScoreBox = matchDiv.querySelector(
            'div[data-testid="left_score"]',
          );
          const awayScoreBox = matchDiv.querySelector(
            'div[data-testid="right_score"]',
          );

          const homeScoreSpan =
            homeScoreBox?.querySelector('span.currentScore');
          const homeScore: number =
            Math.abs(parseInt(homeScoreSpan?.textContent)) ?? -1;
          const awayScoreSpan =
            awayScoreBox?.querySelector('span.currentScore');
          const awayScore: number =
            Math.abs(parseInt(awayScoreSpan?.textContent)) ?? -1;

          const matchData: Match = {
            eventId,
            homeTeamImageUrl: homeTeamImage,
            awayTeamImageUrl: awayTeamImage,
            homeTeamName,
            awayTeamName,
            homeScore,
            awayScore,
            matchStatus,
            timeDate,
          };

          return matchData;
        }),
    );

    return roundMatches;
  }

  private async scrapeAllRounds() {
    try {
      await this.initScraper();

      const roundsBox = await this.page.waitForSelector(Selectors.roundsBox);
      const dropDown = await roundsBox.$(Selectors.dropDown);
      const dropDownButton = await dropDown.$(Selectors.dropDownButton);
      await dropDownButton.click();
      let dropDownItems = await this.page.$$(Selectors.dropDownItems);
      const numberOfRounds = dropDownItems.length;
      await dropDownButton.click();
      const roundsData: Rounds = {};
      for (let i = 1; i <= numberOfRounds; i++) {
        await dropDownButton.click();
        dropDownItems = await this.page.$$(Selectors.dropDownItems);
        await dropDownItems[i - 1].click();
        await this.page.waitForSelector(Selectors.events);
        const events = await this.scrapeRoundMatches();
        roundsData[`Round ${i}`] = events;
      }
      //Logger.debug('Scraped all rounds');
      return roundsData;
    } catch (error) {
      Logger.error("Couldn't scrape all rounds", error);
    }
  }

  private async scrapeAndSaveRounds() {
    // Logger.debug('Scraping and saving rounds');
    const dbRoundsLength = await this.roundRepository.count();
    if (dbRoundsLength > 0) {
      // Logger.debug('Rounds already in database');
      return;
    }
    const roundsData = await this.scrapeAllRounds();
    await this.saveAndCacheRounds(roundsData);

    //Logger.debug('Rounds scraped and saved');
  }

  private async initScraper() {
    if (!this.browser) {
      //DEBUG
      // this.browser = await puppeteer.launch({
      //   headless: false,
      //   slowMo: 1,
      // });
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      //Logger.debug('Browser launched');

      const pages = await this.browser.pages();
      this.page = pages.length > 0 ? pages[0] : await this.browser.newPage();

      await this.page.setViewport({ width: 1920, height: 1080 });
      await this.page.goto(this.superligaURL);
      //Logger.debug('Page loaded');
      const consentButton = await this.page.waitForSelector(
        'button[aria-label="Consent"]',
      );
      await consentButton.click();
      //Logger.debug('Consent accepted');
    }
  }

  async initLiveEvents() {
    const liveRound: RoundEntity = await this.getLiveRound();
    const currentNumLiveMatches = liveRound.matches.filter((match) => {
      !match.matchStatus.includes('FT') ||
        !match.matchStatus.includes('Postponed');
    });
    this.eventEmitter.emit(ServerFootballEvents.INIT_LIVE_MATCHES, {
      numLiveMatches: currentNumLiveMatches.length,
      liveMatches: currentNumLiveMatches,
    });
  }

  async clearCache() {
    return this.cacheManager.reset();
  }

  async onModuleDestroy() {
    await this.browser.close();
  }

  async saveAndCacheRounds(roundsData: Rounds) {
    try {
      for (const [roundName, matches] of Object.entries(roundsData)) {
        let round =
          (await this.roundRepository.findOne({
            where: { roundId: roundName },
          })) ?? new RoundEntity();
        round.roundId = round.roundId ?? roundName;
        round.matches = [];

        const matchEntities: MatchEntity[] = await Promise.all(
          matches.map(async (match) => {
            const matchEntity = new MatchEntity();
            Object.assign(matchEntity, match);

            return matchEntity;
          }),
        );

        round.matches.push(...matchEntities);

        await this.roundRepository.save(round);
      }
      await this.cacheManager.set(CacheKeys.ALL_ROUNDS, roundsData, 0);
    } catch (error) {
      Logger.error('Error saving rounds', error);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  private async fetchAndCacheStanding() {
    try {
      //Logger.debug('Fetching standing');
      await this.initScraper();

      const standing = await this.page.$$eval(
        'a[data-testid="standings_row"]',
        (rows) =>
          rows.map((row) => {
            const flexBox = row.querySelector('div.Box.Flex[display="flex"]');
            const positionBox = flexBox?.querySelector('div.Box');
            const image = flexBox?.querySelector('img');
            const everyBox = flexBox?.querySelectorAll('bdi.Text');
            const teamStanding: TeamStanding = {
              position: parseInt(positionBox?.textContent) ?? -1,
              href: row.getAttribute('href'),
              teamId: parseInt(row.getAttribute('href')?.split('/')[4]) ?? -1,
              teamName:
                flexBox
                  ?.querySelector('div.Box[overflow="auto"]')
                  ?.textContent?.trim() ?? '',
              smallImageSrc: image?.getAttribute('src') ?? '',
              played: parseInt(everyBox?.[0]?.textContent) ?? -1,
              wins: parseInt(everyBox?.[1]?.textContent) ?? -1,
              draws: parseInt(everyBox?.[2]?.textContent) ?? -1,
              losses: parseInt(everyBox?.[3]?.textContent) ?? -1,
              diff: everyBox?.[4]?.textContent ?? '',
              goals: everyBox?.[5]?.textContent ?? '',
              points: parseInt(everyBox?.[6]?.textContent) ?? -1,
            };
            return teamStanding;
          }),
      );
      await this.cacheManager.set(CacheKeys.STANDING, standing, 0);

      const footballEvent: FootballEvent = {
        event: FootballEvents.STANDING_UPDATED,
        data: standing,
      };
      this.eventEmitter.emit(FootballEvents.STANDING_UPDATED, footballEvent);
      //Logger.debug('Standing fetched');
    } catch (error) {
      Logger.error("Couldn't fetch standing", error);
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  private async fetchAndCacheLiveEvents() {
    try {
      // Logger.debug('Fetching live events');
      await this.initScraper();

      const currentRound: number = (await this.getCurrentRoundNum()) ?? -1;
      const numLiveMatches = await this.cacheManager.get<number>(
        CacheKeys.NUM_LIVE_MATCHES,
      );

      const roundsBox = await this.page.waitForSelector(Selectors.roundsBox);

      const dropDown = await roundsBox.$(Selectors.dropDown);
      const dropDownButton = await dropDown.$(Selectors.dropDownButton);
      await dropDownButton.click();
      let dropDownItems = await this.page.$$(Selectors.dropDownItems);
      const numberOfRounds = dropDownItems.length;

      const currentRoundButton =
        dropDownItems[Math.min(currentRound - 1, numberOfRounds - 1)];
      await currentRoundButton.click();

      let liveRoundData = await this.getLiveRound();
      const oldMatchesData = liveRoundData.matches;

      await this.page.waitForSelector(Selectors.events);
      const currentRoundMatches: Match[] = await this.scrapeRoundMatches();

      const currentMatchesData: MatchEntity[] = currentRoundMatches.map(
        (match) => {
          const matchEntity = new MatchEntity();
          Object.assign(matchEntity, match);

          return matchEntity;
        },
      );

      let changedScoreMatches: MatchEntity[] = [];
      let updatedMatches: MatchEntity[] = [];
      if (oldMatchesData) {
        currentMatchesData.forEach((match, i) => {
          const oldMatch = oldMatchesData[i];
          // if only the time or status changed
          if (
            oldMatch.timeDate !== match.timeDate ||
            oldMatch.matchStatus !== match.matchStatus
          ) {
            updatedMatches.push(match);
            // if the score changed
          } else if (
            oldMatch.homeScore !== match.homeScore ||
            oldMatch.awayScore !== match.awayScore
          ) {
            changedScoreMatches.push(match);
            updatedMatches.push(match);
          }
        });
        if (updatedMatches.length === 0) {
          // Logger.debug('No updates found');
          return;
        }
      }

      // Logger.debug('Updates found');
      liveRoundData.matches = currentMatchesData;
      const roundFootballEvent: FootballEvent = {
        event: FootballEvents.LIVE_ROUND_UPDATED,
        data: {
          round: liveRoundData,
          updatedMatches,
        },
      };
      this.eventEmitter.emit(roundFootballEvent.event, roundFootballEvent);

      for (const match of changedScoreMatches) {
        const notificationEvent: NotificationEvent = {
          event: NotificationEvents.LIVE_MATCH_UPDATED,
          data: match,
        };
        this.eventEmitter.emit(notificationEvent.event, notificationEvent);
      }

      await this.roundRepository.save(liveRoundData);
      await this.cacheManager.set(CacheKeys.LIVE_ROUND, liveRoundData, 0);

      // Number of live matches related stuff
      const currentNumLiveMatches = currentRoundMatches.filter((match) => {
        !match.matchStatus.includes('FT') ||
          !match.matchStatus.includes('Postponed');
      }).length;

      if (numLiveMatches) {
        if (currentNumLiveMatches !== numLiveMatches) {
          const footballEvent: FootballEvent = {
            event: FootballEvents.NUM_LIVE_MATCHES_UPDATED,
            data: currentNumLiveMatches,
          };
          this.eventEmitter.emit(footballEvent.event, footballEvent);
        }
      }

      await this.cacheManager.set(
        CacheKeys.NUM_LIVE_MATCHES,
        currentNumLiveMatches,
        0,
      );

      //Logger.debug('Live events updated');
    } catch (error) {
      Logger.error("Couldn't fetch matches", error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  private async fetchAndCacheCurrentRound() {
    try {
      //Logger.debug('Fetching current round');
      const roundsResponse = await (await fetch(this.roundURL)).json();
      const currentRound: number = roundsResponse?.currentRound?.round ?? -1;
      if (currentRound === -1) {
        Logger.error('Could not fetch current round');
        return;
      }
      const cachedCurrentRound = await this.cacheManager.get<number>(
        CacheKeys.CURRENT_ROUND_NUM,
      );

      if (cachedCurrentRound === currentRound) {
        //Logger.debug('Current round already up to date');
        return;
      }

      const footballEvent: FootballEvent = {
        event: FootballEvents.CURRENT_ROUND_UPDATED,
        data: currentRound,
      };
      this.eventEmitter.emit(footballEvent.event, footballEvent);
      //Logger.debug(`Emitted event: ${footballEvent.event}`);

      await this.cacheManager.set(CacheKeys.CURRENT_ROUND_NUM, currentRound, 0);
      //Logger.debug('Current round updated and cached');
    } catch (error) {
      Logger.error("Couldn't fetch current round", error);
    }
  }

  async getData() {
    try {
      const standing: Standing = await this.getStanding();
      const rounds: RoundEntity[] = await this.getRoundsWithMatches();
      const currentRound: number = await this.getCurrentRoundNum();
      const numLiveMatches =
        (await this.cacheManager.get<number>(CacheKeys.NUM_LIVE_MATCHES)) ?? 0;

      const response: FootballData = {
        standing,
        rounds,
        currentRound,
        numLiveMatches,
      };

      return response;
    } catch (error) {
      Logger.error(error);
      return {
        error: 'Could not fetch data',
      };
    }
  }

  private async getStanding() {
    let standing = await this.cacheManager.get<Standing>(CacheKeys.STANDING);
    if (!standing) {
      await this.fetchAndCacheStanding();
      standing = await this.cacheManager.get<Standing>(CacheKeys.STANDING);
      if (!standing) {
        throw new Error('Standing not found');
      }
    }
    return standing;
  }

  private async getRounds() {
    let rounds: RoundEntity[] = await this.roundRepository.find({
      relations: [],
    });
    if (!rounds) {
      await this.scrapeAndSaveRounds();
      rounds = await this.roundRepository.find();
      if (!rounds) {
        throw new Error('Rounds not found');
      }
    }
    return rounds;
  }

  private async getRoundsWithMatches() {
    let rounds: RoundEntity[] = await this.cacheManager.get<RoundEntity[]>(
      CacheKeys.ALL_ROUNDS,
    );
    if (!rounds) {
      rounds = await this.roundRepository.find({
        relations: ['matches'],
      });
      if (!rounds) {
        await this.scrapeAndSaveRounds();
        rounds = await this.roundRepository.find();
        if (!rounds) {
          throw new Error('Rounds not found');
        }
      }
    }
    return rounds;
  }

  private async getCurrentRoundNum() {
    let currentRound = await this.cacheManager.get<number>(
      CacheKeys.CURRENT_ROUND_NUM,
    );
    if (!currentRound) {
      await this.fetchAndCacheCurrentRound();
      currentRound = await this.cacheManager.get<number>(
        CacheKeys.CURRENT_ROUND_NUM,
      );
      if (!currentRound) {
        throw new Error('Current round not found');
      }
    }
    return currentRound;
  }

  private async getLiveRound() {
    let liveRound = await this.cacheManager.get<RoundEntity>(
      CacheKeys.LIVE_ROUND,
    );
    if (!liveRound) {
      const currentRoundNum = await this.getCurrentRoundNum();
      liveRound = (await this.getRoundsWithMatches())[currentRoundNum - 1];
      if (!liveRound) {
        throw new Error('Live round not found');
      }
    }
    return liveRound;
  }

  async getLiveMatches() {
    const liveRound = await this.getLiveRound();
    const liveMatches: MatchEntity[] = liveRound.matches.filter((match) => {
      match.matchStatus !== 'FT' && match.matchStatus !== 'Postponed';
    });

    return liveMatches;
  }

  async addDemoJob() {
    let match: MatchEntity = await this.matchRepository.findOne({
      where: { eventId: 12489689 },
      relations: ['round'],
    });

    let round: RoundEntity = await this.roundRepository.findOne({
      where: { roundId: match.round.roundId },
      relations: ['matches'],
    });

    const matchIndex = round.matches.findIndex(
      (m) => m.eventId === match.eventId,
    );

    this.eventEmitter.emit(FootballEvents.LIVE_MATCH_ADDED, match);

    const job = new CronJob(CronExpression.EVERY_10_SECONDS, () => {
      const which = Math.floor(Math.random() * 2);
      const plusOrMinus = Math.random() < 0.5 ? -1 : 1;
      if (which === 0) {
        match.homeScore += plusOrMinus;
        match.homeScore = Math.max(0, match.homeScore);
        Logger.debug(`Updated home score: ${match.homeScore}`, 'Demo');
      } else {
        match.awayScore += plusOrMinus;
        match.awayScore = Math.max(0, match.awayScore);
        Logger.debug(`Updated away score: ${match.awayScore}`, 'Demo');
      }

      round.matches[matchIndex] = match;

      this.eventEmitter.emit(NotificationEvents.LIVE_MATCH_UPDATED, match);

      const footballEvent: FootballEvent = {
        event: FootballEvents.LIVE_ROUND_UPDATED,
        data: {
          round,
          updatedMatches: [match],
        },
      };

      this.eventEmitter.emit(footballEvent.event, footballEvent);
    });

    this.schedulerRegistry.addCronJob('demo', job);
    job.start();
  }

  async removeDemoJob() {
    this.schedulerRegistry.deleteCronJob('demo');
  }
}
