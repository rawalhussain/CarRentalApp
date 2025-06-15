const pendingRequests: any = {};

export default class RequestDeduplicator {
  static async request<T>(key: string, action: () => Promise<T>) {
    if (pendingRequests[key]) {
      return pendingRequests[key];
    }
    const requestPromise = action().finally(() => {
      delete pendingRequests[key];
    });
    pendingRequests[key] = requestPromise;
    return requestPromise;
  }
}
