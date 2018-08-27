class KeyList(object):
    def __init__(self, original, key_func):
        self.original = original
        self.key_func = key_func

    def __len__(self):
        return len(self.original)

    def __getitem__(self, index):
        return self.key_func(self.original[index])