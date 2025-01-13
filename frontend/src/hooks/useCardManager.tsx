import { Card } from '@/types/models';
import useSWR from 'swr';

type APIResponse = {
  card: Card,
  amount: number,
}[];

const useCardManager = () => {
  const { data: cards, ...rest } = useSWR<APIResponse>('/api/get-cards/');


  return { cards, ...rest };
};

export default useCardManager;
