interface ExecuteButtonProps {
  credits: number;
  currentCredits: number;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}

export default function ExecuteButton({
  credits,
  currentCredits,
  onClick,
  loading = false,
  disabled = false,
  label = '분석하기'
}: ExecuteButtonProps) {
  const insufficientCredits = currentCredits < credits;
  const isDisabled = disabled || loading || insufficientCredits;

  return (
    <div className="space-y-4">
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
          isDisabled
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            분석 중...
          </span>
        ) : (
          `${credits} 크레딧으로 ${label}`
        )}
      </button>

      <div className="flex items-center justify-between text-sm">
        <span className="text-[#ab9eb7]">현재 크레딧</span>
        <span className={`font-semibold ${insufficientCredits ? 'text-red-400' : 'text-white'}`}>
          {currentCredits} 크레딧
        </span>
      </div>

      {insufficientCredits && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400 text-sm">
            크레딧이 부족합니다. 충전 후 이용해주세요.
          </p>
        </div>
      )}
    </div>
  );
}
