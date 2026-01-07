'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { tagClass } from '@/lib/classes';
import { messages } from './messages';

export function CardMessage() {
  const [currentMessage, setCurrentMessage] = useState(messages[0]);
  const [imageNumber, setImageNumber] = useState(1);

  const getRandomMessage = () => {
    const randomIndex = Math.floor(Math.random() * messages.length);
    const randomImage = Math.floor(Math.random() * numberOfGifsAvailable + 1);
    setCurrentMessage(messages[randomIndex]);
    setImageNumber(randomImage);
  };

  useEffect(() => {
    getRandomMessage();
  }, []);

  const numberOfGifsAvailable = 20;

  return (
    <>
      <div className="relative flex justify-between flex-col sm:flex-row gap-2 bg-muted px-6 py-8 pt-12 sm:pt-8 sm:bg-transparent sm:border sm:border-slate-300 sm:border-dashed ">
        <div className="flex flex-col items-start justify-between gap-2">
          <p className="text-base sm:text-sm">{currentMessage.start}</p>
          <p className="text-2xl sm:text-xl font-bold sm:pr-4">
            {currentMessage.curiosity}
          </p>
          <Button
            variant="link"
            className="hidden sm:block text-xs p-0 underline"
            onClick={getRandomMessage}
          >
            Show Another Message
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <div className="my-4 sm:my-0 sm:w-[10em]">
            <AspectRatio ratio={1 / 1}>
              <Image
                src={`/message-pics/fun-fact-${imageNumber}.webp`}
                alt="Message Wow Image"
                className="object-cover"
                unoptimized
                priority
                fill
                sizes="(max-width: 500px) 100vw"
              />
            </AspectRatio>
          </div>
          <Button
            variant="outline"
            className="sm:hidden mt-2"
            onClick={getRandomMessage}
          >
            Show Another Fun Fact
          </Button>
        </div>
        <div className={tagClass}>
          <span className="mr-2">✉️</span>Message
        </div>
      </div>
    </>
  );
}
