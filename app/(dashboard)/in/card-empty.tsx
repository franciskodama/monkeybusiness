import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CardEmpty({
  title,
  description,
  buttonText,
  url
}: {
  title: string;
  description: string;
  buttonText?: string;
  url?: string;
}) {
  return (
    <>
      <div className="relative w-full p-4 sm:border sm:border-slate-300 sm:border-dashed">
        <div className="stripe-border flex flex-col justify-between w-full items-center text-center p-4">
          <p className="text-xs mb-4">{description}</p>
          <Button
            variant="ghost"
            className="text-xs underline underline-offset-4 bg-white sm:bg-transparent p-1 h-4"
          >
            <Link href={`/${url}`}>{buttonText}</Link>
          </Button>
        </div>
        <div className="absolute -top-1 sm:-top-4 left-1/2 transform -translate-x-1/2 p-1 px-2 bg-primary text-white text-xs font-semibold">
          {title}
        </div>
      </div>
    </>
  );
}
