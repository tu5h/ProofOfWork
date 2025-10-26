export default function DemoVideo() {
  return (
    <div className="pt-28 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Product Demo
        </h1>
        <p className="text-lg text-gray-600">
          A quick walkthrough of how ProofOfWork verifies location and authorizes payments.
        </p>
      </div>

      <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-black">
        <div className="[aspect-ratio:16/9]">
          <iframe
            className="w-full h-full"
            src=""
            title="ProofOfWork Demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>

      <section className="max-w-3xl mx-auto mt-10 space-y-4 text-gray-700">
        <h2 className="text-2xl font-bold text-gray-900">What you’ll see</h2>
        <p>
          - How a user request is created and their location verified on-chain.
        </p>
        <p>
          - Automatic rule checks and payment authorization.
        </p>
        <p>
          - Audit trail and security features powered by Concordium.
        </p>
      </section>
    </div>
  );
}