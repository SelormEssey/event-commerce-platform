import { redirect } from 'next/navigation';
import { foundationPath, prototypeDefault } from '../../config/countries';

export default function RootPage() {
  redirect(foundationPath(prototypeDefault.language, prototypeDefault.country));
}
