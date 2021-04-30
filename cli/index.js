#!/usr/bin/env node

const inquirer = require('inquirer');
const sync = require('@algolia-website-search/sync');
const mongodb = require('@algolia-website-search/sync/mongodb');
const dayjs = require('dayjs');

const { log } = console;

process.on('unhandledRejection', (e) => { throw e; });

const run = async () => {
  log('Connecting to MongoDB...');
  await mongodb.connect();

  const questions = [
    {
      type: 'list',
      name: 'command',
      message: 'Choose a command',
      choices: [
        { name: 'Sync', value: 'sync' },
      ],
    },
    {
      type: 'input',
      name: 'tenant',
      message: 'Enter the tenant key for this operation',
      validate: (tenant) => {
        if (tenant.trim()) return true;
        return 'A tenant must be provided.';
      },
    },
    {
      type: 'list',
      name: 'syncAction',
      message: 'Which sync action would you like to run?',
      choices: [
        { name: 'Content: Clear', value: 'content.clear' },
        { name: 'Content: Save One', value: 'content.saveOne' },
        { name: 'Content: Save All', value: 'content.saveAll' },
        { name: 'Content: Save Since', value: 'content.saveSince' },
      ],
      when: (answers) => answers.command === 'sync',
    },
    {
      type: 'number',
      name: 'contentId',
      message: 'Enter the content ID for the action.',
      when: ({ syncAction }) => ['content.saveOne', 'content.deleteOne'].includes(syncAction),
      validate: (contentId) => {
        if (!contentId || !contentId.length !== 8) return 'A valid content ID must be provided';
        return true;
      },
    },
    {
      type: 'input',
      name: 'since',
      message: 'Enter the date to start syncing from.',
      when: ({ syncAction }) => ['content.saveSince'].includes(syncAction),
      validate: (since) => {
        const date = dayjs(since);
        return date.isValid();
      },
      filter: (since) => dayjs(since).toISOString(),
    },
  ];

  const {
    command,
    tenant,
    syncAction,
    contentId,
    since,
  } = await inquirer.prompt(questions);

  if (command === 'sync') {
    log(`Running ${command}:${syncAction}...`);

    let args = {};
    switch (syncAction) {
      case 'content.saveOne':
        args = { id: contentId };
        break;
      case 'content.saveSince':
        args = { date: since };
        break;
      default:
        args = {};
    }
    await sync({ tenant, action: syncAction }, args);
  }

  await mongodb.close();
};

run().catch((e) => setImmediate(() => { throw e; }));
