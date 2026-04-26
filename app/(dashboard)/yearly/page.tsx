import { getUser } from '@/lib/actions/auth';
import { getCategories, getSubcategories } from '@/lib/actions/budget';
import { auth } from '@/lib/auth';
import { YearlyTable } from './yearly-table';
import { DEFAULT_PERSON1_NAME, DEFAULT_PERSON2_NAME } from '@/lib/utils';

export default async function YearlyPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const currentYear = new Date().getFullYear();
  const year = parseInt(searchParams.year?.toString() || currentYear.toString(), 10);
  const session = await auth();
  const user = await getUser(session?.user?.email || '');
  const householdId = user?.householdId || '';

  const categories = await getCategories(householdId);
  const allSubcategories = await getSubcategories(householdId, year);

  const householdUsers = user?.household?.users || [];
  const person1Name =
    user?.household?.person1Name ||
    householdUsers[0]?.name?.split(' ')[0] ||
    DEFAULT_PERSON1_NAME;
  const person2Name =
    user?.household?.person2Name ||
    householdUsers[1]?.name?.split(' ')[0] ||
    DEFAULT_PERSON2_NAME;

  return (
    <YearlyTable
      categories={categories || []}
      initialSubcategories={allSubcategories || []}
      person1Name={person1Name}
      person2Name={person2Name}
      year={year}
    />
  );
}
