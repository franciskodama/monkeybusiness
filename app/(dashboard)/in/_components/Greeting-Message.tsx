'use client';

import { useEffect, useState } from 'react';

type GreetingMessageProps = {
  firstName: string;
};
export function GreetingMessage({ firstName }: GreetingMessageProps) {
  const [greeting, setGreeting] = useState(`Hello ${firstName}!`);

  useEffect(() => {
    setGreeting(getGreeting(firstName));
  }, [firstName]);

  return (
    <h4 className="font-semibold text-sm">
      {greeting}
      <span className="ml-2 text-xl">{getEmoji(greeting)}</span>
    </h4>
  );
}

const getGreeting = (name: string) => {
  const chosen = Math.random();
  switch (true) {
    case chosen > 1 / 2:
      return `Hi ${name}!`;
    case chosen > 1 / 4:
      return `Howdy ${name}!`;
    case chosen > 1 / 8:
      return `Hey ${name}!`;
    case chosen > 1 / 16:
      return `Hola ${name}`;
    case chosen > 1 / 32:
      return `Yo! ${name}!`;
    case chosen > 1 / 64:
      return `Sup ${name}`;
    case chosen > 1 / 128:
      return `Ahoy ${name}`;
    default:
      return `Hello ${name}!`;
  }
};

const getEmoji = (greeting: string) => {
  switch (true) {
    case greeting.includes('Hi'):
      return `👋`;
    case greeting.includes('Howdy'):
      return `🤠`;
    case greeting.includes('Hey'):
      return `✌️`;
    case greeting.includes('Hola'):
      return `🙌`;
    case greeting.includes('Yo'):
      return `😎`;
    case greeting.includes('Sup'):
      return `🤙`;
    case greeting.includes('Ahoy'):
      return `🏴‍☠️`;
    default:
      return `👋`;
  }
};
