import type { Product } from './product.type';

export class productDatabase {
    private database: IDBDatabase | null = null;
    private readonly dbName: string = 'productListDb';
    private readonly storeName: string = 'products';

    // Initialize the database
    constructor() {
        this.initDB();
    }

    //method to initialize the database
    public initDB(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onupgradeneeded = (event) => {
                const database = (event.target as IDBOpenDBRequest).result;
                if (!database.objectStoreNames.contains(this.storeName)) {
                    const store = database.createObjectStore(this.storeName, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    store.createIndex('name', 'name', { unique: false });
                }
            }

            request.onsuccess = () => {
                this.database = request.result;
                resolve();
            };

            request.onerror = () => reject(request.error);
        });
    }

    //method to add a product
    async addProduct(name: string, category: string, price: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.database) return reject('DB not initialized');
            const tx = this.database.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            store.add({ name, category, price });
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    //method to get all products
    async getAllProducts(): Promise<Product[]> {
        return new Promise((resolve, reject) => {
            const transaction = this.database!.transaction(this.storeName, 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    //method to get a product by id
    async getProductById(id: number): Promise<Product | undefined> {
        return new Promise((resolve, reject) => {
            const transaction = this.database!.transaction(this.storeName, 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    //method to update a product
    async updateProduct(id: number, updatedProduct: Product): Promise<void> {
        return new Promise((resolve, reject) => {
            const transaction = this.database!.transaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put({ ...updatedProduct, id });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    //method to delete a product
    async deleteProduct(id: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const transaction = this.database!.transaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}



