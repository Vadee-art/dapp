import { useRoutes } from 'react-router-dom';
import { useUser } from '@/lib/auth';
import { protectedRoutes } from './protected';
import { publicRoutes } from './public';
import { MainLayout } from '@/components/Layout';
import { lazyImport } from '@/utils/lazyImport';

const { ArtworkRoutes } = lazyImport(() => import('@/features/artwork/routes'), 'ArtworkRoutes');
const { HomePage } = lazyImport(() => import('@/features/misc/routes/HomePage'), 'HomePage');

export const AppRoutes = () => {
  const { data: user } = useUser({ suspense: true });

  const commonRoutes = [
    {
      path: '*',
      element: <div>Not Found</div>,
    },
    {
      path: '/',
      element: (
        <MainLayout>
          <HomePage />
        </MainLayout>
      ),
    },
    {
      path: '/artworks',
      element: (
        <MainLayout>
          <ArtworkRoutes/>
        </MainLayout>
      ),
    }
  ];

  const routes = user ? protectedRoutes : publicRoutes;

  const element = useRoutes([...commonRoutes, ...routes]);

  return <>{element}</>;
};