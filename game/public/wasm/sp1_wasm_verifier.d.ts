/* tslint:disable */
/* eslint-disable */
/**
 * Wrapper around [`sp1_verifier::Groth16Verifier::verify`].
 *
 * We hardcode the Groth16 VK bytes to only verify SP1 proofs.
 * @param {Uint8Array} proof
 * @param {Uint8Array} public_inputs
 * @param {string} sp1_vk_hash
 * @returns {boolean}
 */
export function verify_groth16(proof: Uint8Array, public_inputs: Uint8Array, sp1_vk_hash: string): boolean;
/**
 * Wrapper around [`sp1_verifier::PlonkVerifier::verify`].
 *
 * We hardcode the Plonk VK bytes to only verify SP1 proofs.
 * @param {Uint8Array} proof
 * @param {Uint8Array} public_inputs
 * @param {string} sp1_vk_hash
 * @returns {boolean}
 */
export function verify_plonk(proof: Uint8Array, public_inputs: Uint8Array, sp1_vk_hash: string): boolean;
