export interface ProductCategory {
    title: string;
    imageUrl: string;
    description: string;
    linkTo: string;
  }
  
  const productCategories: ProductCategory[] = [
    {
      title: "Water Bottles",
      imageUrl: "/images/categories/water-bottle.jpg",
      description: "Hydration for every athlete",
      linkTo: "/products/water-bottles",
    },
    {
      title: "Running Shoes",
      imageUrl: "/images/categories/running-shoes.jpg",
      description: "Your stride starts here",
      linkTo: "/products/running-shoes",
    },
    {
      title: "Recovery Gear",
      imageUrl: "/images/categories/recovery.jpg",
      description: "From sore to soar",
      linkTo: "/products/recovery",
    },
    {
      title: "Sport Tech",
      imageUrl: "/images/categories/sport-tech.jpg",
      description: "Track, tune, and train smarter",
      linkTo: "/products/tech",
    },
  ];
  
  export default productCategories;
  