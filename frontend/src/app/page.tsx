import { redirect } from 'next/navigation';

// Middleware already routes unauthenticated visitors to /login and
// authenticated ones away from /login — this just gives "/" itself
// somewhere to land.
export default function Home() {
  redirect('/tasks');
}
