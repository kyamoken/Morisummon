import { Card } from '@/types/models';
import { ky } from '@/utils/api';
import { useEffect, useState } from 'react';

type APIResponse = {
  deck_cards: (Card | null)[],
};

const useDeckManager = () => {
  // デッキの最大枚数
  const maxDeckSize = 5;

  const [isLoading, setIsLoading] = useState(true);

  // 編集中のデッキ
  const [editingDeck, setEditingDeck] = useState<(Card | null)[]>(Array(maxDeckSize).fill(null));

  // デッキが取得できたら編集用のデッキにセット
  useEffect(() => {
    const fetchDeck = async () => {
      const res = await ky.get('/api/get-deck/').json<APIResponse>();
      setIsLoading(false);
      setEditingDeck(sanitizeDeckArray(res.deck_cards));
    };

    fetchDeck();
  }, []);

  // useEffect(() => {
  //   if (remoteDeck) {
  //     setEditingDeck([
  //       remoteDeck[0] ?? null,
  //       remoteDeck[1] ?? null,
  //       remoteDeck[2] ?? null,
  //       remoteDeck[3] ?? null,
  //       remoteDeck[4] ?? null,
  //     ]);
  //   }
  // }, [isLoading]);

  /**
   * デッキからindex番目のカードを削除する
   * @param index
   */
  const removeCardFromDeck = (index: number) => {
    if (index < 0 || index >= maxDeckSize) {
      return;
    }

    const newDeck = [...editingDeck];
    newDeck[index] = null;
    setEditingDeck(newDeck);
  }

  /**
   * デッキのindex番目にカードをセットする
   * @param index
   * @param card
   * @throws {Error} indexが範囲外の場合
   */
  const setCardInDeck = (index: number, card: Card) => {
    if (index < 0 || index >= maxDeckSize) {
      throw new Error(`${index}番目のスロットは存在しません`);
    }

    if (editingDeck.includes(card)) {
      return;
    }

    const newDeck = [...editingDeck];
    newDeck[index] = card;
    setEditingDeck(newDeck);
  }

  /**
   * デッキの空きスロットにカードを追加する
   * @param card
   */
  const addCardToDeck = (card: Card) => {
    const newDeck = [...editingDeck];
    const emptySlotIndex = newDeck.findIndex((card) => card === null);
    if (emptySlotIndex >= 0) {
      newDeck[emptySlotIndex] = card;
      setEditingDeck(newDeck);
    }
  }


  /**
   * 現在のデッキを保存する
   */
  const saveDeck = async () => {
    const deck = sanitizeDeckArray(editingDeck);
    const deckIds = [
      deck[0]?.id,
      deck[1]?.id,
      deck[2]?.id,
      deck[3]?.id,
      deck[4]?.id,
    ];

    await ky.post('/api/save-deck/', { json: deckIds });

    // デッキ保存後に編集用デッキを更新
    setEditingDeck(deck);
  }


  /**
   * デッキを編集用に整形する
   * 空きスロットはnullで埋める
   * @param deck
   * @returns
   */
  function sanitizeDeckArray(deck: (Card | null)[]): (Card | null)[] {
    const sanitized = Array(maxDeckSize).fill(null);
    if (!deck) {
      return sanitized;
    }

    deck.forEach((card, index) => {
      if (card) {
        sanitized[index] = card;
      }
    });

    return sanitized;
  }

  return {
    isLoading,

    editingDeck,
    setEditingDeck,

    removeCardFromDeck,
    setCardInDeck,
    addCardToDeck,
    saveDeck,
  };
};

export default useDeckManager;
