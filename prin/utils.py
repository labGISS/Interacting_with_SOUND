def split(array, n):
    """
    Split an array in n parts
    :param array:
    :param n:
    :return:
    """
    # k, m = divmod(len(array), n)
    # return (array[i*k+min(i, m):(i+1)*k+min(i+1, m)] for i in range(n))
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(array), n):
        yield array[i:i + n]
