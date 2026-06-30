/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-expect-error "javascript noob"
import tadej from "../bots/dummies/tadej.js"
import jonas from "../bots/dummies/jonas"
import wout from "../bots/dummies/wout"

// Ok nu de echte
// import mark from "../bots/mark.ts"
// import niels from "../bots/niels"
// import daan from "../bots/daan";
// import tom from "../bots/tom";
// import lucas from "../bots/lucas"
// import hannah from "../bots/hannah/hannah"
// import joran from "../bots/joran/joran"
// import hendrik from "../bots/hendrik"

import type { Bot } from "../models/auction.models";

export const BOTS: { [key: string]: Bot } = {
  jonas: {
    key: "jonas",
    owner: "Jonas",
    name: "Hatsiekadee",
    code: jonas,
  },
  tadej: {
    key: "tadej",
    owner: "Tadej",
    name: "Hotseflots",
    code: tadej,
  },
  wout: {
    key: "wout",
    owner: "Wout",
    name: "Gezellig",
    code: wout,
  },
  // mark: {
  //   key: "mark",
  //   owner: "Mark",
  //   name: "Lekker Fietsen",
  //   code: mark,
  // },
  // 'hendrik': {
  //   key: 'hendrik',
  //   owner: 'De Betere Niels',
  //   name: 'Lekker blijven trappen',
  //   code: hendrik
  // },
  // 'tom': {
  //   key: 'tom',
  //   owner: 'Tom',
  //   name: 'Lekker Fietsen',
  //   code: tom
  // },
  // daan: {
  //   key: "daan",
  //   owner: "Daan",
  //   name: "De ultieme veiler",
  //   code: daan,
  // },
  // 'niels': {
  //   key: 'niels',
  //   owner: 'Niels',
  //   name: 'De gezelligstebiedbot',
  //   code: niels
  // },
  // 'lucas': {
  //   key: 'lucas',
  //   owner: 'Lucas',
  //   name: 'Lucadance 100rpm',
  //   code: lucas
  // },
  // 'joran': {
  //   key: 'joran',
  //   owner: 'Joran',
  //   name: 'Hallo',
  //   code: joran
  // },
  // 'hannah': {
  //   key: 'hannah',
  //   owner: 'Hannah',
  //   name: 'Hoi',
  //   code: hannah
  // },
}
