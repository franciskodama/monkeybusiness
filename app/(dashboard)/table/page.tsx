import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

export default async function TablePage() {
  return (
    <Card className="relative">
      <CardHeader className="sm:mb-12">
        <CardTitle className="flex justify-between items-center gap-2">
          <p>Table</p>
        </CardTitle>
        <CardDescription>Nitty gritty</CardDescription>
      </CardHeader>
      <CardContent>
        <>
          <div className="flex flex-col w-full h-[32em] justify-center items-center">
            Table! But nothing here! Xuuuupaaaa...
          </div>
        </>
      </CardContent>
    </Card>
  );
}
