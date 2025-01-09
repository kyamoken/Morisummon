from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    rank = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    money = models.IntegerField(default=0)

    def __str__(self):
        return self.username

# class CustomUser(AbstractUser):
    # rank = models.IntegerField(default=0) # ランク
    # wins = models.IntegerField(default=0) # 勝利数
    # # deck = models.ForeignKey('Deck', on_delete=models.CASCADE, null=True, blank=True) # デッキ
    # money = models.IntegerField(default=0) # お金

# class Card(models.Model):
#     name = models.CharField(max_length=255) # 名前
#     hp = models.IntegerField(default=0) # 体力
#     attack = models.IntegerField(default=0) # 攻撃力
#     image = models.ImageField(upload_to='images/') # 画像
#     amount = models.IntegerField(default=0) # カードの枚数
#
# class Deck(models.Model):
#     name = models.CharField(max_length=255) # 名前
#     user = models.ForeignKey(CustomUser, on_delete=models.CASCADE) # ユーザー
#     deck_id = models.IntegerField(default=0) # デッキID
#     card = models.ManyToManyField(Card) # カード

# class Matching(models.Model):
#     user1 = models.ForeignKey(CustomUser, on_delete=models.CASCADE) # ユーザー1
#     user2 = models.ForeignKey(CustomUser, on_delete=models.CASCADE) # ユーザー2
#     status = models.IntegerField(default=0) # ステータス
#     password = models.CharField(max_length=255) # パスワード

# class Battle(models.Model):
#     user1 = models.ForeignKey(CustomUser, on_delete=models.CASCADE) # ユーザー1
#     user2 = models.ForeignKey(CustomUser, on_delete=models.CASCADE) # ユーザー2
#
#     user1_hp = models.IntegerField(default=0) # ユーザー1の体力
#     user2_hp = models.IntegerField(default=0) # ユーザー2の体力
#
#
#     user1_attack = models.IntegerField(default=0) # ユーザー1の攻撃力
#     user2_attack = models.IntegerField(default=0) # ユーザー2の攻撃力
#     turn = models.IntegerField(default=0) # ターン
#     status = models.IntegerField(default=0) # ステータス
#



# ユーザー name, password, rank, deck, wins, money
#　カード name, hp, attack, image
# デッキ name, user, card1, card2, card3, card4, card5, card6, card7, card8, card9, card10
# マッチング user1, user2, status, password
# 対戦 user1, user2, user1_hp, user2_hp, user1_attack, user2_attack, user1_turn, user2_turn, user1_win, user2_win, status
# ランキング user, win, lose, draw, rank,
# ログ user, message, time

# ゲームルール
# ・１vs１
# ・カードは10枚持てる
# ・相手の体力を先に削った方の勝利
# ・体力は３ポイント制
# ・カードはガチャで入手できる
# ・カードにはそれぞれの種類に応じて、HP、攻撃力が設定されている。
# ・仕様は某ポケ〇ンカードゲームのような仕様にしていきたい（これはパクリというわけではなく、GPTへ説明する上での参考になる具体例であるだけです。）
#
# ＵＩ設計
# ・ログイン画面
# ・メインページ、ログイン後の各設定画面（デッキ設定、ユーザーネーム設定等）
# ・デッキ設定画面
# ・マッチング画面
# ・対戦画面
# ・結果画面
#
# 遷移
# ・未ログイン→ログイン画面
# ・ログイン済→メインページ
#
# バックエンド
# ・WebSocketを使用してリアルタイム対戦を実現していく。
# ・ターン終了ボタンを押したら相手のターンとするのが一番効率がいいかと思っています。
#
# UID欲しい
# 眠い
#
#
# 開発環境
#
# ・Svelte + Django(Django REST Framework) + WebSocket
