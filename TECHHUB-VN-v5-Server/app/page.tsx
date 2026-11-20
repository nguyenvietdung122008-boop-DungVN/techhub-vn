import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionUser } from '../deployment/auth.mjs';
import Hub from './Hub';

export default async function Home() {
    if (!sessionUser(await headers())) redirect('/sign-in');
    return <Hub />;
}
