.class public final Lcom/signhere/offline/MainActivity;
.super Landroid/app/Activity;
.source "MainActivity.java"


# static fields
.field private static final HOST:Ljava/lang/String; = "signhere-offline.local"

.field private static final SELECT_FILE:I = 0x1


# instance fields
.field private fileCallback:Landroid/webkit/ValueCallback;
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "Landroid/webkit/ValueCallback<",
            "[",
            "Landroid/net/Uri;",
            ">;"
        }
    .end annotation
.end field

.field private game:Landroid/webkit/WebView;


# direct methods
.method public constructor <init>()V
    .locals 0

    .line 21
    invoke-direct {p0}, Landroid/app/Activity;-><init>()V

    return-void
.end method

.method static synthetic access$000(Landroid/net/Uri;)Z
    .locals 0

    .line 21
    invoke-static {p0}, Lcom/signhere/offline/MainActivity;->local(Landroid/net/Uri;)Z

    move-result p0

    return p0
.end method

.method static synthetic access$100()Landroid/webkit/WebResourceResponse;
    .locals 1

    .line 21
    invoke-static {}, Lcom/signhere/offline/MainActivity;->missing()Landroid/webkit/WebResourceResponse;

    move-result-object v0

    return-object v0
.end method

.method static synthetic access$200(Lcom/signhere/offline/MainActivity;)Landroid/webkit/ValueCallback;
    .locals 0

    .line 21
    iget-object p0, p0, Lcom/signhere/offline/MainActivity;->fileCallback:Landroid/webkit/ValueCallback;

    return-object p0
.end method

.method static synthetic access$202(Lcom/signhere/offline/MainActivity;Landroid/webkit/ValueCallback;)Landroid/webkit/ValueCallback;
    .locals 0

    .line 21
    iput-object p1, p0, Lcom/signhere/offline/MainActivity;->fileCallback:Landroid/webkit/ValueCallback;

    return-object p1
.end method

.method static synthetic lambda$onCreate$0(Landroid/view/View;Landroid/view/WindowInsets;)Landroid/view/WindowInsets;
    .locals 2

    .line 81
    invoke-static {}, Landroid/view/WindowInsets$Type;->ime()I

    move-result v0

    invoke-virtual {p1, v0}, Landroid/view/WindowInsets;->getInsets(I)Landroid/graphics/Insets;

    move-result-object v0

    .line 82
    const/4 v1, 0x0

    iget v0, v0, Landroid/graphics/Insets;->bottom:I

    invoke-virtual {p0, v1, v1, v1, v0}, Landroid/view/View;->setPadding(IIII)V

    .line 83
    return-object p1
.end method

.method private static local(Landroid/net/Uri;)Z
    .locals 2

    .line 102
    const-string v0, "https"

    invoke-virtual {p0}, Landroid/net/Uri;->getScheme()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_0

    const-string v0, "signhere-offline.local"

    invoke-virtual {p0}, Landroid/net/Uri;->getHost()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_0

    invoke-virtual {p0}, Landroid/net/Uri;->getPort()I

    move-result p0

    const/4 v0, -0x1

    if-ne p0, v0, :cond_0

    const/4 p0, 0x1

    goto :goto_0

    :cond_0
    const/4 p0, 0x0

    :goto_0
    return p0
.end method

.method private static missing()Landroid/webkit/WebResourceResponse;
    .locals 8

    .line 106
    new-instance v7, Landroid/webkit/WebResourceResponse;

    .line 107
    invoke-static {}, Ljava/util/Collections;->emptyMap()Ljava/util/Map;

    move-result-object v5

    new-instance v6, Ljava/io/ByteArrayInputStream;

    const/4 v0, 0x0

    new-array v0, v0, [B

    invoke-direct {v6, v0}, Ljava/io/ByteArrayInputStream;-><init>([B)V

    const-string v1, "text/plain"

    const-string v2, "utf-8"

    const/16 v3, 0x194

    const-string v4, "Not Found"

    move-object v0, v7

    invoke-direct/range {v0 .. v6}, Landroid/webkit/WebResourceResponse;-><init>(Ljava/lang/String;Ljava/lang/String;ILjava/lang/String;Ljava/util/Map;Ljava/io/InputStream;)V

    .line 106
    return-object v7
.end method


# virtual methods
.method protected onActivityResult(IILandroid/content/Intent;)V
    .locals 1

    .line 111
    invoke-super {p0, p1, p2, p3}, Landroid/app/Activity;->onActivityResult(IILandroid/content/Intent;)V

    .line 112
    const/4 v0, 0x1

    if-ne p1, v0, :cond_1

    iget-object p1, p0, Lcom/signhere/offline/MainActivity;->fileCallback:Landroid/webkit/ValueCallback;

    if-nez p1, :cond_0

    goto :goto_0

    .line 113
    :cond_0
    iget-object p1, p0, Lcom/signhere/offline/MainActivity;->fileCallback:Landroid/webkit/ValueCallback;

    .line 114
    const/4 v0, 0x0

    iput-object v0, p0, Lcom/signhere/offline/MainActivity;->fileCallback:Landroid/webkit/ValueCallback;

    .line 115
    invoke-static {p2, p3}, Landroid/webkit/WebChromeClient$FileChooserParams;->parseResult(ILandroid/content/Intent;)[Landroid/net/Uri;

    move-result-object p2

    invoke-interface {p1, p2}, Landroid/webkit/ValueCallback;->onReceiveValue(Ljava/lang/Object;)V

    .line 116
    return-void

    .line 112
    :cond_1
    :goto_0
    return-void
.end method

.method public onBackPressed()V
    .locals 3

    .line 119
    iget-object v0, p0, Lcom/signhere/offline/MainActivity;->game:Landroid/webkit/WebView;

    const-string v1, "window.dispatchEvent(new Event(\'signhere-back\'))"

    const/4 v2, 0x0

    invoke-virtual {v0, v1, v2}, Landroid/webkit/WebView;->evaluateJavascript(Ljava/lang/String;Landroid/webkit/ValueCallback;)V

    .line 120
    return-void
.end method

.method public onCreate(Landroid/os/Bundle;)V
    .locals 4

    .line 28
    invoke-super {p0, p1}, Landroid/app/Activity;->onCreate(Landroid/os/Bundle;)V

    .line 29
    new-instance p1, Landroid/webkit/WebView;

    invoke-direct {p1, p0}, Landroid/webkit/WebView;-><init>(Landroid/content/Context;)V

    iput-object p1, p0, Lcom/signhere/offline/MainActivity;->game:Landroid/webkit/WebView;

    .line 30
    iget-object p1, p0, Lcom/signhere/offline/MainActivity;->game:Landroid/webkit/WebView;

    const v0, -0xebeaea

    invoke-virtual {p1, v0}, Landroid/webkit/WebView;->setBackgroundColor(I)V

    .line 31
    iget-object p1, p0, Lcom/signhere/offline/MainActivity;->game:Landroid/webkit/WebView;

    invoke-virtual {p1}, Landroid/webkit/WebView;->getSettings()Landroid/webkit/WebSettings;

    move-result-object p1

    const/4 v1, 0x1

    invoke-virtual {p1, v1}, Landroid/webkit/WebSettings;->setJavaScriptEnabled(Z)V

    .line 32
    iget-object p1, p0, Lcom/signhere/offline/MainActivity;->game:Landroid/webkit/WebView;

    invoke-virtual {p1}, Landroid/webkit/WebView;->getSettings()Landroid/webkit/WebSettings;

    move-result-object p1

    invoke-virtual {p1, v1}, Landroid/webkit/WebSettings;->setDomStorageEnabled(Z)V

    .line 33
    iget-object p1, p0, Lcom/signhere/offline/MainActivity;->game:Landroid/webkit/WebView;

    invoke-virtual {p1}, Landroid/webkit/WebView;->getSettings()Landroid/webkit/WebSettings;

    move-result-object p1

    const/4 v2, 0x0

    invoke-virtual {p1, v2}, Landroid/webkit/WebSettings;->setAllowFileAccess(Z)V

    .line 34
    iget-object p1, p0, Lcom/signhere/offline/MainActivity;->game:Landroid/webkit/WebView;

    invoke-virtual {p1}, Landroid/webkit/WebView;->getSettings()Landroid/webkit/WebSettings;

    move-result-object p1

    invoke-virtual {p1, v2}, Landroid/webkit/WebSettings;->setAllowContentAccess(Z)V

    .line 35
    iget-object p1, p0, Lcom/signhere/offline/MainActivity;->game:Landroid/webkit/WebView;

    invoke-virtual {p1}, Landroid/webkit/WebView;->getSettings()Landroid/webkit/WebSettings;

    move-result-object p1

    invoke-virtual {p1, v1}, Landroid/webkit/WebSettings;->setBlockNetworkLoads(Z)V

    .line 36
    iget-object p1, p0, Lcom/signhere/offline/MainActivity;->game:Landroid/webkit/WebView;

    new-instance v1, Lcom/signhere/offline/MainActivity$1;

    invoke-direct {v1, p0}, Lcom/signhere/offline/MainActivity$1;-><init>(Lcom/signhere/offline/MainActivity;)V

    invoke-virtual {p1, v1}, Landroid/webkit/WebView;->setWebViewClient(Landroid/webkit/WebViewClient;)V

    .line 58
    iget-object p1, p0, Lcom/signhere/offline/MainActivity;->game:Landroid/webkit/WebView;

    new-instance v1, Lcom/signhere/offline/MainActivity$2;

    invoke-direct {v1, p0}, Lcom/signhere/offline/MainActivity$2;-><init>(Lcom/signhere/offline/MainActivity;)V

    invoke-virtual {p1, v1}, Landroid/webkit/WebView;->setWebChromeClient(Landroid/webkit/WebChromeClient;)V

    .line 77
    new-instance p1, Landroid/widget/FrameLayout;

    invoke-direct {p1, p0}, Landroid/widget/FrameLayout;-><init>(Landroid/content/Context;)V

    .line 78
    invoke-virtual {p1, v0}, Landroid/widget/FrameLayout;->setBackgroundColor(I)V

    .line 79
    iget-object v0, p0, Lcom/signhere/offline/MainActivity;->game:Landroid/webkit/WebView;

    new-instance v1, Landroid/widget/FrameLayout$LayoutParams;

    const/4 v3, -0x1

    invoke-direct {v1, v3, v3}, Landroid/widget/FrameLayout$LayoutParams;-><init>(II)V

    invoke-virtual {p1, v0, v1}, Landroid/widget/FrameLayout;->addView(Landroid/view/View;Landroid/view/ViewGroup$LayoutParams;)V

    .line 80
    new-instance v0, Lcom/signhere/offline/MainActivity$$ExternalSyntheticLambda0;

    invoke-direct {v0}, Lcom/signhere/offline/MainActivity$$ExternalSyntheticLambda0;-><init>()V

    invoke-virtual {p1, v0}, Landroid/widget/FrameLayout;->setOnApplyWindowInsetsListener(Landroid/view/View$OnApplyWindowInsetsListener;)V

    .line 85
    invoke-virtual {p0}, Lcom/signhere/offline/MainActivity;->getWindow()Landroid/view/Window;

    move-result-object v0

    invoke-virtual {v0, v2}, Landroid/view/Window;->setDecorFitsSystemWindows(Z)V

    .line 86
    invoke-virtual {p0}, Lcom/signhere/offline/MainActivity;->getWindow()Landroid/view/Window;

    move-result-object v0

    invoke-virtual {v0}, Landroid/view/Window;->getAttributes()Landroid/view/WindowManager$LayoutParams;

    move-result-object v0

    const/4 v1, 0x3

    iput v1, v0, Landroid/view/WindowManager$LayoutParams;->layoutInDisplayCutoutMode:I

    .line 88
    invoke-virtual {p0, p1}, Lcom/signhere/offline/MainActivity;->setContentView(Landroid/view/View;)V

    .line 89
    iget-object p1, p0, Lcom/signhere/offline/MainActivity;->game:Landroid/webkit/WebView;

    new-instance v0, Lcom/signhere/offline/SaveExport;

    invoke-direct {v0, p1}, Lcom/signhere/offline/SaveExport;-><init>(Landroid/webkit/WebView;)V

    const-string v1, "SignHereSaveExport"

    invoke-virtual {p1, v0, v1}, Landroid/webkit/WebView;->addJavascriptInterface(Ljava/lang/Object;Ljava/lang/String;)V

    const-string v0, "https://signhere-offline.local/"

    invoke-virtual {p1, v0}, Landroid/webkit/WebView;->loadUrl(Ljava/lang/String;)V

    .line 90
    return-void
.end method

.method public onWindowFocusChanged(Z)V
    .locals 1

    .line 93
    invoke-super {p0, p1}, Landroid/app/Activity;->onWindowFocusChanged(Z)V

    .line 94
    if-eqz p1, :cond_0

    .line 95
    invoke-virtual {p0}, Lcom/signhere/offline/MainActivity;->getWindow()Landroid/view/Window;

    move-result-object p1

    invoke-virtual {p1}, Landroid/view/Window;->getInsetsController()Landroid/view/WindowInsetsController;

    move-result-object p1

    .line 96
    const/4 v0, 0x2

    invoke-interface {p1, v0}, Landroid/view/WindowInsetsController;->setSystemBarsBehavior(I)V

    .line 97
    invoke-static {}, Landroid/view/WindowInsets$Type;->systemBars()I

    move-result v0

    invoke-interface {p1, v0}, Landroid/view/WindowInsetsController;->hide(I)V

    .line 99
    :cond_0
    return-void
.end method
