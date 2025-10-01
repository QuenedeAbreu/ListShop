import { Metadata } from 'next';

export interface PageProps {
  params: { id: string };
  searchParams?: Record<string, string | string[]>;
}

export function generateMetadata({ params }: PageProps): Metadata;