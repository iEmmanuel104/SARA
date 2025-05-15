import { DwellrLogo } from "@/components/logo"

export default function LogoShowcase() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8 space-y-12">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Dwellr.xyz Logo</h1>
                    <p className="text-gray-600 max-w-lg mx-auto">
                        A modern logo for your AI-powered real estate platform, featuring a bot inside a house to represent the AI
                        assistant for property searches.
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Logo on white background */}
                    <div className="bg-white p-8 rounded-lg flex flex-col items-center justify-center space-y-2">
                        <DwellrLogo size="large" />
                        <p className="text-sm text-gray-500 mt-4">Standard logo (hover to see animation)</p>
                    </div>

                    {/* Logo on dark background */}
                    <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-8 rounded-lg flex flex-col items-center justify-center space-y-2">
                        <DwellrLogo size="large" />
                        <p className="text-sm text-gray-300 mt-4">Logo on dark background</p>
                    </div>

                    {/* Logo sizes */}
                    <div className="bg-gray-100 p-8 rounded-lg space-y-6">
                        <h3 className="text-xl font-medium text-center text-gray-700">Logo Sizes</h3>
                        <div className="flex flex-col space-y-6 items-start">
                            <div className="flex items-center space-x-4">
                                <DwellrLogo size="small" />
                                <span className="text-gray-500 text-sm">Small</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <DwellrLogo size="default" />
                                <span className="text-gray-500 text-sm">Default</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <DwellrLogo size="large" />
                                <span className="text-gray-500 text-sm">Large</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
