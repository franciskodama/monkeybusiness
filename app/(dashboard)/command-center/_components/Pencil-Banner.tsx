'use client';

import { useEffect, useState } from 'react';

export default function PencilBanner() {
  const [randomIndex, setRandomIndex] = useState(0);

  useEffect(() => {
    setRandomIndex(Math.floor(Math.random() * quotes.length));
  }, []);

  return (
    <div>
      <div className="flex flex-col items-center px-8 py-2 bg-primary border-0">
        <div className="flex tracking-wide text-[10px] sm:text-xs md:text-sm text-white text-center uppercase font-semibold">
          <p>"{quotes[randomIndex].quote}"</p>
          <p className="mx-2">—</p>
          <p>{quotes[randomIndex].author}</p>
        </div>
      </div>
    </div>
  );
}

const quotes = [
  {
    quote:
      'A budget is telling your money where to go instead of wondering where it went.',
    author: 'Dave Ramsey'
  },
  {
    quote:
      "The goal isn't more money. The goal is living your life on your own terms.",
    author: 'Chris Brogan'
  },
  {
    quote:
      'Your capacity to say ‘No’ determines your capacity to say ‘Yes’ to greater things.',
    author: 'E. Stanley Jones'
  },
  {
    quote: 'Automation is to time what compound interest is to money.',
    author: 'Rory Vaden'
  },
  {
    quote:
      'Do not save what is left after spending, but spend what is left after saving.',
    author: 'Warren Buffett'
  },
  {
    quote:
      "Financial peace isn't the acquisition of stuff. It's learning to live on less than you make.",
    author: 'Dave Ramsey'
  },
  {
    quote: 'Beware of little expenses; a small leak will sink a great ship.',
    author: 'Benjamin Franklin'
  },
  {
    quote: 'Money is a terrible master but an excellent servant.',
    author: 'P.T. Barnum'
  },
  {
    quote: 'The art is not in making money, but in keeping it.',
    author: 'Proverb'
  },
  {
    quote:
      'Time is more valuable than money. You can get more money, but you cannot get more time.',
    author: 'Jim Rohn'
  },
  {
    quote:
      'Efficiency is doing things right; effectiveness is doing the right things.',
    author: 'Peter Drucker'
  },
  {
    quote: 'The way we spend our time defines who we are.',
    author: 'Jonathan Estrin'
  },
  {
    quote:
      'Automation applied to an efficient operation will magnify the efficiency.',
    author: 'Bill Gates'
  },
  {
    quote: 'You cannot manage what you do not measure.',
    author: 'William Thompson'
  },
  {
    quote: 'Modern technology: less time doing, more time living.',
    author: 'Anonymous'
  },
  {
    quote: 'The formal business of a family is to create a space for the soul.',
    author: 'John Eldredge'
  },
  {
    quote:
      'A home is not a place, it’s a feeling—and financial peace protects that feeling.',
    author: 'Anonymous'
  },
  {
    quote:
      'The greatest reward of financial discipline is the freedom to focus on your family.',
    author: 'Anonymous'
  },
  {
    quote:
      "Don't let the 'business' of life get in the way of living your life.",
    author: 'Anonymous'
  },
  {
    quote: 'Invest in your time today, so you can spend it with them tomorrow.',
    author: 'Monkey Business Team'
  },
  {
    quote:
      "Budgeting is the art of making sure you don't spend money you haven't earned.",
    author: 'Amish Proverb'
  },
  {
    quote:
      'It’s not about how much money you make, but how much money you keep.',
    author: 'Robert Kiyosaki'
  },
  {
    quote: 'Small habits lead to big changes. One cell at a time.',
    author: 'Anonymous'
  },
  {
    quote: 'A year from now, you will wish you had started today.',
    author: 'Karen Lamb'
  },
  {
    quote: 'Control your money, or the lack of it will forever control you.',
    author: 'Dave Ramsey'
  },
  {
    quote: "Don't let your finances become a circus. Be the ringmaster.",
    author: 'Anonymous'
  },
  {
    quote: 'Smart monkeys save their bananas for the rainy seasons.',
    author: 'Old Jungle Saying'
  },
  {
    quote:
      'The best time to plant a tree was 20 years ago. The second best time is now.',
    author: 'Chinese Proverb'
  },
  {
    quote:
      'Even the smallest banana contributes to the bunch. Track every win.',
    author: 'Anonymous'
  },
  {
    quote: 'Chaos is a choice. Clarity is a click away.',
    author: 'Monkey Business Team'
  }
];
