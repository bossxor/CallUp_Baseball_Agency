.class Lcom/signhere/offline/MainActivity$1;
.super Landroid/webkit/WebViewClient;
.source "MainActivity.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingMethod;
    value = Lcom/signhere/offline/MainActivity;->onCreate(Landroid/os/Bundle;)V
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x0
    name = null
.end annotation


# instance fields
.field final synthetic this$0:Lcom/signhere/offline/MainActivity;


# direct methods
.method constructor <init>(Lcom/signhere/offline/MainActivity;)V
    .locals 0

    .line 36
    iput-object p1, p0, Lcom/signhere/offline/MainActivity$1;->this$0:Lcom/signhere/offline/MainActivity;

    invoke-direct {p0}, Landroid/webkit/WebViewClient;-><init>()V

    return-void
.end method


# virtual methods
.method public shouldInterceptRequest(Landroid/webkit/WebView;Landroid/webkit/WebResourceRequest;)Landroid/webkit/WebResourceResponse;
    .locals 5

    .line 42
    invoke-interface {p2}, Landroid/webkit/WebResourceRequest;->getUrl()Landroid/net/Uri;

    move-result-object p1

    .line 43
    invoke-virtual {p1}, Landroid/net/Uri;->getPath()Ljava/lang/String;

    move-result-object p2

    .line 44
    invoke-static {p1}, Lcom/signhere/offline/MainActivity;->access$000(Landroid/net/Uri;)Z

    move-result p1

    if-eqz p1, :cond_5

    if-eqz p2, :cond_5

    const-string p1, ".."

    invoke-virtual {p2, p1}, Ljava/lang/String;->contains(Ljava/lang/CharSequence;)Z

    move-result p1

    if-nez p1, :cond_5

    const-string p1, "\\"

    invoke-virtual {p2, p1}, Ljava/lang/String;->contains(Ljava/lang/CharSequence;)Z

    move-result p1

    if-eqz p1, :cond_0

    goto :goto_0

    .line 45
    :cond_0
    const-string p1, "/"

    invoke-virtual {p2, p1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result p1

    if-eqz p1, :cond_1

    const-string p2, "/index.html"

    .line 46
    :cond_1
    invoke-static {}, Landroid/webkit/MimeTypeMap;->getSingleton()Landroid/webkit/MimeTypeMap;

    move-result-object p1

    .line 47
    const/16 v0, 0x2e

    invoke-virtual {p2, v0}, Ljava/lang/String;->lastIndexOf(I)I

    move-result v0

    add-int/lit8 v0, v0, 0x1

    invoke-virtual {p2, v0}, Ljava/lang/String;->substring(I)Ljava/lang/String;

    move-result-object v0

    sget-object v1, Ljava/util/Locale;->ROOT:Ljava/util/Locale;

    invoke-virtual {v0, v1}, Ljava/lang/String;->toLowerCase(Ljava/util/Locale;)Ljava/lang/String;

    move-result-object v0

    .line 46
    invoke-virtual {p1, v0}, Landroid/webkit/MimeTypeMap;->getMimeTypeFromExtension(Ljava/lang/String;)Ljava/lang/String;

    move-result-object p1

    .line 48
    const-string v0, ".js"

    invoke-virtual {p2, v0}, Ljava/lang/String;->endsWith(Ljava/lang/String;)Z

    move-result v0

    if-eqz v0, :cond_2

    const-string p1, "text/javascript"

    .line 49
    :cond_2
    const-string v0, ".woff2"

    invoke-virtual {p2, v0}, Ljava/lang/String;->endsWith(Ljava/lang/String;)Z

    move-result v0

    if-eqz v0, :cond_3

    const-string p1, "font/woff2"

    .line 51
    :cond_3
    :try_start_0
    new-instance v0, Landroid/webkit/WebResourceResponse;

    if-nez p1, :cond_4

    const-string p1, "application/octet-stream"

    :cond_4
    const-string v1, "utf-8"

    iget-object v2, p0, Lcom/signhere/offline/MainActivity$1;->this$0:Lcom/signhere/offline/MainActivity;

    .line 52
    invoke-virtual {v2}, Lcom/signhere/offline/MainActivity;->getAssets()Landroid/content/res/AssetManager;

    move-result-object v2

    new-instance v3, Ljava/lang/StringBuilder;

    invoke-direct {v3}, Ljava/lang/StringBuilder;-><init>()V

    const-string v4, "public"

    invoke-virtual {v3, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v3

    invoke-virtual {v3, p2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object p2

    invoke-virtual {p2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object p2

    invoke-virtual {v2, p2}, Landroid/content/res/AssetManager;->open(Ljava/lang/String;)Ljava/io/InputStream;

    move-result-object p2

    invoke-direct {v0, p1, v1, p2}, Landroid/webkit/WebResourceResponse;-><init>(Ljava/lang/String;Ljava/lang/String;Ljava/io/InputStream;)V
    :try_end_0
    .catch Ljava/io/IOException; {:try_start_0 .. :try_end_0} :catch_0

    .line 51
    return-object v0

    .line 53
    :catch_0
    move-exception p1

    .line 54
    invoke-static {}, Lcom/signhere/offline/MainActivity;->access$100()Landroid/webkit/WebResourceResponse;

    move-result-object p1

    return-object p1

    .line 44
    :cond_5
    :goto_0
    invoke-static {}, Lcom/signhere/offline/MainActivity;->access$100()Landroid/webkit/WebResourceResponse;

    move-result-object p1

    return-object p1
.end method

.method public shouldOverrideUrlLoading(Landroid/webkit/WebView;Landroid/webkit/WebResourceRequest;)Z
    .locals 0

    .line 38
    invoke-interface {p2}, Landroid/webkit/WebResourceRequest;->getUrl()Landroid/net/Uri;

    move-result-object p1

    invoke-static {p1}, Lcom/signhere/offline/MainActivity;->access$000(Landroid/net/Uri;)Z

    move-result p1

    xor-int/lit8 p1, p1, 0x1

    return p1
.end method
