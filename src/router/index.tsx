import { createBrowserRouter, Navigate } from 'react-router-dom';
import { SplashScreen } from '@/screens/SplashScreen';
import { FilmListScreen } from '@/screens/FilmListScreen';
import { ShootingScreen } from '@/screens/ShootingScreen';
import { RollDetailScreen } from '@/screens/RollDetailScreen';
import { MasterDataScreen } from '@/screens/MasterDataScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';

export const router = createBrowserRouter([
    { path: '/', element: <SplashScreen /> },
    { path: '/rolls', element: <FilmListScreen /> },
    { path: '/rolls/:rollId', element: <RollDetailScreen /> },
    { path: '/shoot', element: <ShootingScreen /> },
    { path: '/master', element: <MasterDataScreen /> },
    { path: '/settings', element: <SettingsScreen /> },
    { path: '*', element: <Navigate to="/" replace /> },
]);
