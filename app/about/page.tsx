import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="container py-8 space-y-8 mx-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">本ページについて</h1>
        
        {/* <Card>
          <CardContent className="pt-6"> */}
            <p className="mb-4"> 
              本ホームページは、日中古典戯曲研究の発展と深化を目的として開設されました。特に、中国古典戯曲に関する日本国内の所蔵状況を調査・整理し、その成果を広く公開することを主な目標としています。
            </p>
            <p>
              この研究は、日本に伝わる中国古典戯曲資料のうち、日本人による註釈や書き入れが施されたものを中心に行われています。これらの貴重な資料を収集・調査・翻刻することで、新たな学術的価値を見出し、アジア文学史における国際的な比較研究の発展に寄与することを目指します。
            </p>
          {/* </CardContent>
        </Card> */}

        <Card>
          <CardHeader>
            <CardTitle>設立の目的</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              古典籍は、私たちの教養や知識の根幹を成すものであり、適切な研究と利用は、健全な社会の発展や文化の継承に不可欠です。しかし、特に日本人による中国戯曲資料の収集と研究は、まだ十分に進んでいない分野です。
            </p>
            <p className="mt-4">
              このページは、そうした研究の遅れを補う拠点として機能し、研究者同士の交流や情報共有を促進することを目的としています。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>基本機能</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">本ホームページは、以下の機能を備え、研究者にとって有用なリソースを提供します：</p>
            <ul className="list-disc pl-6 space-y-4">
              <li>
                <strong>中国戯曲日本語書入れデータベース</strong>
                <p className="mt-1">
                  日本国内に所蔵されている中国古典戯曲資料の中から、日本人による書き入れが施されたものを特定し、研究用データベースとして整備・公開します。
                </p>
              </li>
              <li>
                <strong>研究支援ツールの提供</strong>
                <p className="mt-1">
                  収集した資料を活用した調査研究を支援するため、データベース機能に加えて、閲覧や分析に便利な各種ツールを提供します。
                </p>
              </li>
              <li>
                <strong>研究成果の公開</strong>
                <p className="mt-1">
                  業務に支障のない範囲で、研究の進捗や成果を報告し、広く公開していきます。
                </p>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>利用に関する注意事項</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2">
              <li>本ホームページの利用は、管理者が認めた範囲に限られます。</li>
              <li>利用に際しては、インターネットドメイン、IPアドレス、閲覧履歴等の情報を収集する場合がありますが、法令に基づく措置を除き、第三者への提供は行いません。</li>
              <li>登録された情報は、自身の研究目的に限り使用できます。その他の目的での利用は固く禁じます。</li>
              <li>本ホームページに掲載された内容は、研究の過程で得られた試行的な情報も含まれており、その正確性を完全に保証するものではありません。情報の利用により生じたいかなる損害についても、当研究所は責任を負いかねます。</li>
              <li>ご利用の際は、セキュリティの観点から、最新のOSやブラウザをご使用ください。</li>
              <li>PDFやJPEGなどのファイル形式を利用することがあるため、必要なプラグインは各自ご準備ください。</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
