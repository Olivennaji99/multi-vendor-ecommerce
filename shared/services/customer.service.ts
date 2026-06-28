import { CustomerProfile } from "../models/CustomerProfile.model";
import { ForbiddenError, NotFoundError } from "../lib/errors";
import type { AddressInput } from "../schemas/order.schema";
import type { Actor } from "../types/actor";

async function getOrCreateProfile(customerId: string) {
  let profile = await CustomerProfile.findOne({ user: customerId });
  if (!profile) {
    profile = await CustomerProfile.create({ user: customerId, addresses: [] });
  }
  return profile;
}

export async function getCustomerProfile(actor: Actor) {
  if (actor.role !== "CUSTOMER") throw new ForbiddenError();
  return getOrCreateProfile(actor.id);
}

export async function addAddress(actor: Actor, address: AddressInput & { label?: string }) {
  if (actor.role !== "CUSTOMER") throw new ForbiddenError();

  const profile = await getOrCreateProfile(actor.id);
  const isFirstAddress = profile.addresses.length === 0;

  profile.addresses.push({
    label: address.label ?? "Home",
    line1: address.line1,
    line2: address.line2 ?? "",
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    phone: address.phone,
    isDefault: isFirstAddress,
  } as never);

  await profile.save();
  return profile;
}

export async function removeAddress(actor: Actor, addressId: string) {
  if (actor.role !== "CUSTOMER") throw new ForbiddenError();

  const profile = await CustomerProfile.findOne({ user: actor.id });
  if (!profile) throw new NotFoundError("Profile not found");

  profile.addresses = profile.addresses.filter((address) => address._id.toString() !== addressId);
  await profile.save();
  return profile;
}

export async function setDefaultAddress(actor: Actor, addressId: string) {
  if (actor.role !== "CUSTOMER") throw new ForbiddenError();

  const profile = await CustomerProfile.findOne({ user: actor.id });
  if (!profile) throw new NotFoundError("Profile not found");

  for (const address of profile.addresses) {
    address.isDefault = address._id.toString() === addressId;
  }
  await profile.save();
  return profile;
}
