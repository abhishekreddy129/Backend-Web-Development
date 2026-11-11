'use strict';

const { Worker } = require('bullmq');
const { transporter } = require('./email');
const { connection } = require('./queue');

const worker = new Worker('email', async (job) => {
  if (job.name !== 'otp') {
    throw new Error(`Unsupported email job: ${job.name}`);
  }

  const { to, otp } = job.data;
  await transporter.sendMail({
    to,
    subject: 'Your verification code',
    text: `Your verification code for ${to} is ${otp}. It expires in 10 minutes.`,
  });
}, { connection });

worker.on('completed', (job) => {
  console.log(`Email job ${job.id} completed`);
});

worker.on('failed', (job, error) => {
  console.error(`Email job ${job?.id ?? 'unknown'} failed:`, error);
});

module.exports = { worker };
