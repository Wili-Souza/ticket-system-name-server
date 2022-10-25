const database = [];

// [
//   {
//     address: '192.168.1.9:7071',
//     name: 'ticketService',
//     sent: 0
//   }
// ]

const getLeastBusyServiceIndex = (services) => {
  const values = services.map((service) => service.sent);
  const indexOfLeastBusy = values.indexOf(Math.min(...values));
  return indexOfLeastBusy;
};

export const postService = (data) => {
  let registered = false;
  let taken = false;

  database.forEach((item) => {
    if (item.address === data.address && item.name === data.name) {
      registered = true;
    } else if (item.address === data.address) {
      taken = true;
    }
  });

  if (registered) {
    return true;
  }

  if (taken) {
    return false;
  }

  database.push({
    ...data,
    sent: 0,
  });

  console.log("[--- REGISTRADO]: ", data);
  return true;
};

export const getService = (serviceName) => {
  const sameAddressesRegistered = database.filter(
    (item) => item.name === serviceName
  );

  if (sameAddressesRegistered.length === 1) {
    return sameAddressesRegistered[0].address;
  }

  if (sameAddressesRegistered.length > 1) {
    console.log("[-- ofertados]: ", sameAddressesRegistered);
    const leastBusyIndex = getLeastBusyServiceIndex(sameAddressesRegistered);
    sameAddressesRegistered[leastBusyIndex].sent++;
    console.log(
      "[--- ENVIADO]: ",
      sameAddressesRegistered[leastBusyIndex].address
    );
    return sameAddressesRegistered[leastBusyIndex].address;
  }

  return undefined;
};

export const getAllServices = (servicesNames) => {
  const services = database.filter((service) =>
    servicesNames.includes(service.name)
  );
  const servicesAddresses = services.map((service) => service.address);
  return servicesAddresses;
};

export const deleteService = (serviceAddress) => {
  const serviceIndex = database.findIndex(
    (item) => item.address === serviceAddress
  );
  if (serviceIndex >= 0) {
    database.splice(serviceIndex, 1);
    console.log("[--- REMOVIDO]: ", serviceAddress);
    return true;
  }
  return false;
};
