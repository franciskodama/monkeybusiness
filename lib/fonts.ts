import {
  Barlow,
  Josefin_Sans,
  Jost,
  Kumbh_Sans,
  Lexend
} from 'next/font/google';

export const barlow = Barlow({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin']
});

export const kumbh_sans = Kumbh_Sans({
  weight: ['500', '600', '700', '800'],
  subsets: ['latin']
});

export const josefin_sans = Josefin_Sans({
  weight: ['500', '600', '700'],
  subsets: ['latin']
});

export const jost = Jost({
  weight: ['500', '600', '700'],
  subsets: ['latin']
});

export const lexend = Lexend({
  weight: ['500', '600', '700'],
  subsets: ['latin']
});
