import re

class dictutil:
    @staticmethod
    def get(dic, keys, default=None):
        """
        dictのネストされた値を取得する
        :param dic: dict
        :param keys: str ドット区切りのキー
        :param default: any デフォルト値
        :return: any キーに対応する値
        """
        keys = keys.split(".")
        for key in keys:
            dic = dic.get(key, None)
            if dic is None:
                return default
        return dic

    @staticmethod
    def set(dic, keys, value):
        """
        dictのネストされた値を設定した新しいdictを返す
        :param dic: dict
        :param keys: str ドット区切りのキー
        :param value: any 設定する値
        :return: dict 設定後のdict
        """
        keys = keys.split(".")
        new_dic = dic.copy()
        dictutil.write(new_dic, keys, value)
        return new_dic

    @staticmethod
    def write(dic, keys, value):
        """
        dictのネストされた値を設定する
        :param dic: dict
        :param keys: str ドット区切りのキー
        :param value: any 設定する値
        """
        keys = keys.split(".")
        temp_dic = dic
        for key in keys[:-1]:
            if key not in temp_dic or not isinstance(temp_dic[key], dict):
                temp_dic[key] = {}
            temp_dic = temp_dic[key]
        temp_dic[keys[-1]] = value

    @staticmethod
    def deleted(dic, keys):
        """
        dictのネストされた値を削除した新しいdictを返す
        :param dic: dict
        :param keys: str ドット区切りのキー
        :return: dict 削除後のdict
        """
        keys = keys.split(".")
        new_dic = dic.copy()
        temp_dic = new_dic
        for key in keys[:-1]:
            temp_dic = temp_dic.get(key, None)
            if temp_dic is None:
                return new_dic
        if keys[-1] in temp_dic:
            del temp_dic[keys[-1]]
        return new_dic

    @staticmethod
    def delete(dic, keys):
        """
        dictのネストされた値を削除する
        :param dic: dict
        :param keys: str ドット区切りのキー
        """
        keys = keys.split(".")
        temp_dic = dic
        for key in keys[:-1]:
            temp_dic = temp_dic.get(key, None)
            if temp_dic is None:
                return
        if keys[-1] in temp_dic:
            del temp_dic[keys[-1]]
