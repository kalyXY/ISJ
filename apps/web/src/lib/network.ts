export class NetworkService {
  private static instance: NetworkService;
  private isOnlineState: boolean = true;
  private listeners: Array<(isOnline: boolean) => void> = [];

  private constructor() {
    if (typeof window !== 'undefined') {
      this.isOnlineState = navigator.onLine;
      this.setupEventListeners();
    }
  }

  public static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  private setupEventListeners(): void {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  private handleOnline(): void {
    this.isOnlineState = true;
    this.notifyListeners(true);
  }

  private handleOffline(): void {
    this.isOnlineState = false;
    this.notifyListeners(false);
  }

  private notifyListeners(isOnline: boolean): void {
    this.listeners.forEach(listener => listener(isOnline));
  }

  public isOnline(): boolean {
    return this.isOnlineState;
  }

  public addListener(listener: (isOnline: boolean) => void): () => void {
    this.listeners.push(listener);
    
    // Retourner une fonction de nettoyage
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public removeAllListeners(): void {
    this.listeners = [];
  }

  // Test de connectivité réelle (ping vers le serveur)
  public async testRealConnectivity(): Promise<boolean> {
    if (!this.isOnlineState) return false;
    
    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000) // Timeout de 5 secondes
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline.bind(this));
      window.removeEventListener('offline', this.handleOffline.bind(this));
    }
    this.removeAllListeners();
  }
}