// app/your-page.tsx
// import { PaymentButton } from '@/components/post-card';

import { PaymentButton } from "@/components/paymentbtn";

export default function Page() {
  // This is now a Server Component
  return (
    <div className="container mx-auto p-4">
      <div className="grid gap-6">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-bold mb-2">Premium Plan</h2>
          <p className="mb-4">Access to all premium features</p>
          {/* PaymentButton is a Client Component */}
          {/* <PaymentButton
            itemId={1}
            itemName="Premium Plan"
            className="w-full"
          /> */}
          <PaymentButton
            itemId={1}
            itemName="Premium Plan"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
