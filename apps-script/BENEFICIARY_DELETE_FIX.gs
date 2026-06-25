// Add this block inside handleAction_(action, payload, requestMeta),
// near the other schemeBeneficiaries.* routes.
if (action === "schemeBeneficiaries.delete" || action === "schemeBeneficiary.delete") {
  return deleteRowById_(SHEETS.SCHEME_BENEFICIARIES, payload.id);
}
