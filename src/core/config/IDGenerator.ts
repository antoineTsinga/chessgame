export default class IDGenerator {
  private static instance: IDGenerator;
  private currentId: number;

  // Le constructeur est privé pour empêcher l'instanciation directe.
  private constructor() {
    this.currentId = 0;
  }

  // Méthode statique pour obtenir l'instance unique.
  public static getInstance(): IDGenerator {
    if (!IDGenerator.instance) {
      IDGenerator.instance = new IDGenerator();
    }
    return IDGenerator.instance;
  }

  // Méthode pour générer des IDs numériques.
  public generateId(): number {
    return ++this.currentId;
  }
}
