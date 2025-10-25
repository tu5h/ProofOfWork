export const metadata = {
    title: "Contact Us - ProofOfWork",
    description: "Get in touch with the ProofOfWork team",
};

export default function ContactPage() {
    return (
        <div className="pt-28 pb-20 px-6">
            <div className="max-w-5xl mx-auto text-center mb-10">
                <h1 className="text-5xl lg:text-5xl font-bold text-gray-900 mb-4">
                    Contact Us
                </h1>
                <p className="text-lg text-gray-600">
                    Have questions about ProofOfWork? Send us a message and we’ll get back to you.
                </p>
            </div>

            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
                    <form
                        className="space-y-5"
                        method="post"
                        action="https://formspree.io/f/xblznngr">

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Alex Johnson"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="you@company.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                                Company (optional)
                            </label>
                            <input
                                id="company"
                                name="company"
                                type="text"
                                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Amazon.com Inc."
                            />
                        </div>

                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                                Subject
                            </label>
                            <input
                                id="subject"
                                name="subject"
                                type="text"
                                required
                                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Partnership, pricing, or general question"
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                rows={6}
                                required
                                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Tell us a bit about your use case..."
                            />
                        </div>

                        <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            title="Submit contact form"
                        >
                            Send message
                        </button>
                    </form>
                </div>

                <aside className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Other ways to reach us</h2>
                    <ul className="space-y-3 text-gray-700">
                        <li>
                            <div className="text-sm font-medium text-gray-900">Email</div>
                            <a className="text-blue-600 hover:underline break-words" href="mailto:proofofworkconcord@gmail.com">
                                proofofworkconcord@gmail.com
                            </a>
                        </li>
                        <li>
                            <div className="text-sm font-medium text-gray-900">GitHub</div>
                            <a className="text-blue-600 hover:underline" href="https://github.com/tu5h/ProofOfWork" target="_blank" rel="noreferrer">
                                tu5h/ProofOfWork
                            </a>
                        </li>
                    </ul>
                </aside>
            </div>
        </div>
    );
}