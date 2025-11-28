export interface PaymentUser {
  id: string;
  email: string;
  name: string;
  last_name: string;
}

export interface PaymentOrder {
  dev_reference: number;
  description: string;
  amount: number;
  installments_type: number;
  currency: string;
}

export interface PaymentConfiguration {
  partial_payment: boolean;
  expiration_days: number;
  allowed_payment_methods: string[];
  success_url: string;
  failure_url: string;
  pending_url: string;
  review_url: string;
}

export interface PaymentRequest {
  user: PaymentUser;
  order: PaymentOrder;
  configuration: PaymentConfiguration;
}

export interface PaymentInfo {
  payment_url: string;
  payment_qr: string;
}

export interface PaymentOrderResponse {
  id: string;
  status: string;
  dev_reference: number;
  description: string;
  currency: string;
  amount: number;
}

export interface PaymentResponse {
  success: boolean;
  detail: string;
  data?: {
    user: {
      id: string;
      email: string;
    };
    order: PaymentOrderResponse;
    payment: PaymentInfo;
  };
}
