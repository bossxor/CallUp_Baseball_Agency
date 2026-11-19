import assert from 'node:assert/strict';
import test from 'node:test';
import { advanceWeeks, createGame, moveReportPage, readSave, reportPlayers } from '../src/game.ts';

const save = () => true;

test('a batch saves the two quiet weeks and stops at the scouting report', () => {
  const initial = createGame();
  const saved: number[] = [];
  const result = advanceWeeks(initial, 4, (state) => {
    saved.push(state.week);
    return true;
  });

  assert.equal(result.reason, 'important');
  assert.equal(result.advanced, 3);
  assert.deepEqual(saved, [2, 3, 4]);
  assert.deepEqual(result.state.history.slice(-3).map(({ kind }) => kind), ['quiet', 'quiet', 'scout']);
  assert.ok(result.state.history.slice(-3).every(({ games }) => games > 0));
  assert.equal(initial.week, 1);
  assert.equal(initial.history.at(-1)?.week ?? 1, 1);
});

test('batch progress matches one-week progress and stops again at the call-up', () => {
  const initial = createGame();
  const scout = advanceWeeks(initial, 4, save).state;
  const singleSteps = [1, 1, 1].reduce((state, count) => advanceWeeks(state, count, save).state, initial);
  assert.deepEqual(scout, singleSteps);

  const result = advanceWeeks(scout, 4, save);
  assert.equal(result.reason, 'important');
  assert.equal(result.state.week, 7);
  assert.equal(result.state.history.at(-1)?.kind, 'callup');
});

test('a pending offer limits advancement until its deadline', () => {
  const scout = advanceWeeks(createGame(), 4, save).state;
  const callup = advanceWeeks(scout, 4, save).state;
  const offer = advanceWeeks(callup, 4, save);
  assert.equal(offer.reason, 'important');
  assert.equal(offer.state.week, 9);
  assert.equal(offer.state.history.at(-1)?.kind, 'offer');

  const pending = advanceWeeks(offer.state, 4, save);
  assert.equal(pending.reason, 'pending');
  assert.equal(pending.advanced, 1);
  const expiration = advanceWeeks(pending.state, 4, save);
  assert.equal(expiration.state.week, 11);
  assert.equal(advanceWeeks(expiration.state, 99, save).state.week, 15);
});

test('zero and invalid week counts still advance a week', () => {
  assert.equal(advanceWeeks(createGame(), 0, save).advanced, 1);
  assert.equal(advanceWeeks(createGame(), Number.NaN, save).advanced, 1);
});

test('a failed save leaves progress at the last successful week', () => {
  const failed = advanceWeeks(createGame(), 4, ({ week }) => week < 3);
  assert.equal(failed.reason, 'save-error');
  assert.equal(failed.advanced, 1);
  assert.equal(failed.state.week, 2);
  assert.equal(failed.state.history.at(-1)?.week, 2);
  const resumed = advanceWeeks(failed.state, 4, save);
  assert.equal(resumed.state.week, 4);
  assert.deepEqual(resumed.state.history, advanceWeeks(createGame(), 4, save).state.history);
});

test('report pages stay in bounds and restore from a save', () => {
  const initial = createGame();
  assert.equal(moveReportPage(initial, 1).reportPage, 0);
  const scout = advanceWeeks(initial, 4, save).state;
  assert.equal(moveReportPage(scout, -1).reportPage, 0);
  const lastPage = moveReportPage(scout, 99);
  assert.equal(lastPage.reportPage, reportPlayers.length - 1);
  assert.ok(reportPlayers.length >= 2);
  assert.equal(scout.reportPage, 0);
  assert.deepEqual(readSave(JSON.stringify(lastPage)), lastPage);
});

test('unrecognized saves and malformed history are rejected', () => {
  assert.equal(readSave(null), null);
  assert.equal(readSave('{'), null);
  assert.equal(readSave('null'), null);
  assert.equal(readSave(JSON.stringify({ ...createGame(), version: 2 })), null);
  assert.equal(readSave(JSON.stringify({ ...createGame(), reportPage: 99 })), null);
  assert.equal(readSave(JSON.stringify({ ...createGame(), history: [null] })), null);
  assert.equal(readSave(JSON.stringify({ ...createGame(), week: 2 })), null);
});

test('scouting potential is shown as an ordered estimate on a 100-point scale', () => {
  for (const { potential } of reportPlayers) {
    const range = potential.match(/^(\d+)–(\d+)점 \/ 100점/);
    assert.ok(range);
    const lower = Number(range[1]);
    const upper = Number(range[2]);
    assert.ok(lower >= 0 && lower < upper && upper <= 100);
  }
});
