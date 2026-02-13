import { CheckCircle, Clock, Shield } from 'lucide-react';

const InterviewComplete = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-24 h-24 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Interview Completed Successfully!
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Thank you for completing your INTERVUEX interview. Your responses have been recorded and will be reviewed by our recruitment team.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-blue-50 rounded-lg">
            <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="font-semibold text-gray-900">Completed</p>
            <p className="text-sm text-gray-600">Interview finished</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="font-semibold text-gray-900">Recorded</p>
            <p className="text-sm text-gray-600">All responses saved</p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="font-semibold text-gray-900">Under Review</p>
            <p className="text-sm text-gray-600">Being evaluated</p>
          </div>
        </div>

        <div className="p-6 bg-gray-50 rounded-lg text-left">
          <h3 className="font-bold text-gray-900 mb-3">What happens next?</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✓ Your interview will be reviewed by our AI evaluation system</li>
            <li>✓ A recruiter will assess your responses and performance</li>
            <li>✓ You will receive feedback within 3-5 business days</li>
            <li>✓ If selected, you'll be contacted for the next round</li>
          </ul>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          You can now close this window. Thank you for your time!
        </p>
      </div>
    </div>
  );
};

export default InterviewComplete;
