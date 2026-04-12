// ============================================================
// INNOVATION DATA — aggregated from individual entry files
// ============================================================
// Each file in this folder exports a single { entry } object.
// This index imports them in chronological order.
//
// ADDING A NEW ENTRY:
//   1. Create a new file in this folder (use the `diag` key as filename)
//   2. Export: export const entry = { year, name, diag, problem, whyNotSooner, whoInvented, examples }
//   3. Import it here and add to the array in chronological order
//
// SCHEMA per entry:
//   year:         number | string — year or year range
//   name:         string — display name of the innovation
//   diag:         string — stable unique key for the entry
//   oneLiner:     string — <60 char layman-friendly takeaway
//   problem:      string — detailed description of the problem solved
//   whyNotSooner: string — detailed explanation of why this wasn't invented earlier
//   whoInvented:  string — who led the key project(s) or cluster(s) behind the idea
//   examples:     string — comma-separated example models (rendered as a bullet list)
// ============================================================
import { entry as perceptron } from './perceptron';
import { entry as backprop } from './backprop';
import { entry as rnn } from './rnn';
import { entry as lstm } from './lstm';
import { entry as word2vec } from './word2vec';
import { entry as seq2seq } from './seq2seq';
import { entry as attention } from './attention';
import { entry as resnet } from './resnet';
import { entry as tokenization } from './tokenization';
import { entry as transformer } from './transformer';
import { entry as gpt1 } from './gpt1';
import { entry as bert } from './bert';
import { entry as gpt2 } from './gpt2';
import { entry as scalinglaws } from './scalinglaws';
import { entry as gpt3 } from './gpt3';
import { entry as vit } from './vit';
import { entry as moe } from './moe';
import { entry as rope } from './rope';
import { entry as sft } from './sft';
import { entry as rlhf } from './rlhf';
import { entry as cot } from './cot';
import { entry as chinchilla } from './chinchilla';
import { entry as flash } from './flash';
import { entry as gpt4 } from './gpt4';
import { entry as longctx } from './longctx';
import { entry as ttc } from './ttc';
import { entry as ssm } from './ssm';
import { entry as tooluse } from './tooluse';
import { entry as scaffold } from './scaffold';
export const data = [
  perceptron,
  backprop,
  rnn,
  lstm,
  word2vec,
  seq2seq,
  attention,
  resnet,
  tokenization,
  transformer,
  gpt1,
  bert,
  gpt2,
  scalinglaws,
  gpt3,
  vit,
  moe,
  rope,
  sft,
  rlhf,
  cot,
  chinchilla,
  flash,
  gpt4,
  longctx,
  ttc,
  ssm,
  tooluse,
  scaffold,
];
