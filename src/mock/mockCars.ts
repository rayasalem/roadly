export type MockCar = {
  id: string;
  providerId: string;
  name: string;
  year: number;
  pricePerDay: number;
  transmission: 'automatic' | 'manual';
  seats: number;
  image: string;
  available: boolean;
};

function makeCar(id: string, providerId: string, name: string, year: number, pricePerDay: number, available = true): MockCar {
  return {
    id,
    providerId,
    name,
    year,
    pricePerDay,
    transmission: 'automatic',
    seats: 5,
    image: 'car_placeholder',
    available,
  };
}

export const MOCK_CARS: MockCar[] = [
  // rental_1
  makeCar('car_1', 'rental_1', 'Toyota Corolla', 2022, 120, true),
  makeCar('car_2', 'rental_1', 'Hyundai Elantra', 2021, 110, true),
  makeCar('car_3', 'rental_1', 'Kia Sportage', 2020, 150, false),
  makeCar('car_4', 'rental_1', 'Nissan Sunny', 2019, 90, true),

  // rental_2
  makeCar('car_5', 'rental_2', 'Toyota Camry', 2022, 180, true),
  makeCar('car_6', 'rental_2', 'Honda Civic', 2021, 140, true),
  makeCar('car_7', 'rental_2', 'Mazda 3', 2020, 130, false),
  makeCar('car_8', 'rental_2', 'Mitsubishi Lancer', 2018, 95, true),

  // rental_3
  makeCar('car_9', 'rental_3', 'Kia Picanto', 2020, 80, true),
  makeCar('car_10', 'rental_3', 'Hyundai i10', 2021, 85, true),
  makeCar('car_11', 'rental_3', 'Toyota Yaris', 2019, 90, false),
  makeCar('car_12', 'rental_3', 'Renault Symbol', 2018, 75, true),

  // rental_4
  makeCar('car_13', 'rental_4', 'Mercedes E200', 2022, 450, true),
  makeCar('car_14', 'rental_4', 'BMW 530i', 2021, 480, true),
  makeCar('car_15', 'rental_4', 'Audi A6', 2021, 430, false),
  makeCar('car_16', 'rental_4', 'Range Rover Sport', 2020, 550, true),

  // rental_5
  makeCar('car_17', 'rental_5', 'Toyota Land Cruiser', 2020, 400, true),
  makeCar('car_18', 'rental_5', 'Nissan Patrol', 2019, 380, true),
  makeCar('car_19', 'rental_5', 'Chevrolet Tahoe', 2018, 360, false),
  makeCar('car_20', 'rental_5', 'GMC Yukon', 2018, 350, true),
];

