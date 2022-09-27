// usar arquivo
const database = [];

export const postService = (data) => {
  const sameAddressesRegistered = database.filter(
    (item) => item.address === data.adress
  );
  if (sameAddressesRegistered.length > 0) {
    return false;
  }
  database.push(data);
  console.log(database);
  return true;
};

export const getService = (serviceName) => {
  const sameAddressesRegistered = database.filter(
    (item) => item.name === serviceName
  );
  if (sameAddressesRegistered.length > 0) {
    // TODO: selecionar um dos serviços disponíveis em caso > 1
    return sameAddressesRegistered[0].address;
  }
  return undefined;
};

export const deleteService = (serviceAddress) => {
  const serviceIndex = database.findIndex(
    (item) => item.address === serviceAddress
  );
  if (serviceIndex >= 0) {
    database.splice(serviceIndex, 1);
    console.log(database);
    return true;
  }
  return false;
};
