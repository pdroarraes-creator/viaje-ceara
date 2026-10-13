// Recebe o áudio do /admin e salva numa pasta "Rumbo a Ceará" do seu Google Drive.
// Configuração (uma vez, ~3 min):
// 1. Abra script.google.com > Novo projeto > cole este arquivo.
// 2. Configurações do projeto > Propriedades do script > adicione TOKEN = uma senha longa inventada por você.
// 3. Implantar > Nova implantação > Tipo: App da Web > Executar como: Eu > Quem tem acesso: Qualquer pessoa. Autorize.
// 4. Copie a URL (termina em /exec) e o TOKEN e cole no card "Enviar para o Drive" do /admin (ficam só no seu navegador).
function doPost(e) {
  var p = JSON.parse(e.postData.contents);
  var tok = PropertiesService.getScriptProperties().getProperty("TOKEN");
  if (!tok || p.token !== tok) return ContentService.createTextOutput("no");
  var name = String(p.name || "arquivo").replace(/[^\w.\-]/g, "_").slice(0, 80);
  var it = DriveApp.getFoldersByName("Rumbo a Ceará");
  var folder = it.hasNext() ? it.next() : DriveApp.createFolder("Rumbo a Ceará");
  folder.createFile(Utilities.newBlob(Utilities.base64Decode(p.data), p.mime || "application/octet-stream", name));
  return ContentService.createTextOutput("ok");
}
