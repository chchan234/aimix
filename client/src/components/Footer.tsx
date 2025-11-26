import { Link } from 'wouter';

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Links */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-6">
          <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            이용안내
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            개인정보취급방침
          </Link>
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            이용약관
          </Link>
        </div>

        {/* Business Info */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>
            <span className="font-medium">상호명:</span> 콜드카우 |
            <span className="font-medium ml-2">대표자명:</span> 이찬우 |
            <span className="font-medium ml-2">사업자등록번호:</span> 108-36-63273
          </p>
          <p>
            <span className="font-medium">사업장주소:</span> 용인시 수지구 현암로 148 스카이프라자 602호
          </p>
          <p>
            <span className="font-medium">전화번호:</span> 010-6558-0068
          </p>
          <p className="pt-3 text-muted-foreground/70">
            &copy; {new Date().getFullYear()} AI PORT. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
