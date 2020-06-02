import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({ where: { name } });

    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const findProducts = await this.ormRepository.find({
      where: {
        id: In(products),
      },
    });

    return findProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productIds = products.map<IFindProducts>(
      (product: IFindProducts): IFindProducts => {
        return { id: product.id };
      },
    );
    const findProducts = await this.findAllById(productIds);

    const updateProducts: Product[] = findProducts.map(product => {
      const findCurrentProduct = products.find(
        findProduct => findProduct.id === product.id,
      );

      return {
        ...product,
        quantity: findCurrentProduct?.quantity || 0,
      };
    });

    await this.ormRepository.save(updateProducts);

    return updateProducts;
  }
}

export default ProductsRepository;
