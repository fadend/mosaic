function MakeArray(n) {
  this.length = n;
  for (var i = 1; i <= n; i++) {
    this[i] = 0;
  }
  return this;
}

function MosaicMaker() {
  document.write("<table border=0 width=280 cellspacing=0 cellpadding=0>");
  row = new MakeArray(25);
  row[1] = "00000000000000";
  row[2] = "00001111111100";
  row[3] = "00010000000010";
  row[4] = "00100000000010";
  row[5] = "01000000000010";
  row[6] = "01000000000001";
  row[7] = "01001110111101";
  row[8] = "01000000100001";
  row[9] = "01000100101001";
  row[10] = "01000000100001";
  row[11] = "01000000100001";
  row[12] = "01000000100001";
  row[13] = "01000000100001";
  row[14] = "01000000100001";
  row[15] = "01000011100001";
  row[16] = "01000000000010";
  row[17] = "01000000000010";
  row[18] = "01000111110010";
  row[19] = "00100000000010";
  row[20] = "00100000000100";
  row[21] = "00010000000100";
  row[22] = "00001000001000";
  row[23] = "00000100010000";
  row[24] = "00000011100000";
  row[25] = "00000000000000";

  for (var n = 1; n <= 25; n++) {
    document.write("<tr>");
    for (var c = 1; c <= 14; c++) {
      var oldc = c - 1;
      var giffy = row[n].substring(oldc, c);
      if (giffy == "0") {
        var imgsrc = "images/white.gif";
      } else {
        var imgsrc = "images/black.gif";
      }
      document.write(
        "<td><img src=" + imgsrc + " width=20 height=20 border=0></td>",
      );
    }
    document.write("</tr>");
  }
  document.write("</table>");
}
