#!/usr/bin/env node

const inquirer = require('inquirer');
const sync = require('@algolia-website-search/sync');
const mongodb = require('@algolia-website-search/sync/mongodb');

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
    },
    {
      type: 'list',
      name: 'syncAction',
      message: 'Which sync action would you like to run?',
      choices: [
        { name: 'Content: Save One', value: 'content.saveOne' },
        { name: 'Content: Save All', value: 'content.saveAll' },
      ],
      when: (answers) => answers.command === 'sync',
    },
    {
      type: 'number',
      name: 'contentId',
      message: 'Enter the content ID for the action.',
      when: ({ syncAction }) => ['content.saveOne', 'content.deleteOne'].includes(syncAction),
    },
  ];

  const {
    command,
    tenant,
    syncAction,
    contentId,
  } = await inquirer.prompt(questions);

  if (command === 'sync') {
    log(`Running ${command}:${syncAction}...`);
    if (syncAction === 'content.saveOne') {
      await sync({ tenant, action: syncAction }, { id: contentId });
    } else if (syncAction === 'content.saveAll') {
      await sync({ tenant, action: syncAction });
    }
  }

  await mongodb.close();
};

run().catch((e) => setImmediate(() => { throw e; }));
