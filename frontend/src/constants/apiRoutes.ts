export const API_ROUTES = {
  CREATE_ORDER: '/create-order',
  CANCEL_ORDER: (uid: string) => `/cancel-order/${uid}`,
  ORDER_STATUS: (uid: string) => `/order-status/${uid}`,
  ORDER_CODES: (uid: string) => `/order-codes/${uid}`,
  GIFT_CARD_TYPES: '/gift-card-types',
  GIFT_CARD_TYPE_BY_ID: (id: number) => `/gift-card-types/${id}`,
};