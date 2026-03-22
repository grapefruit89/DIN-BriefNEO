# Font Assets

Drop your `.woff2` files here and uncomment the `@font-face` blocks in `css/typography.css`.

## Recommended fonts

| File                  | Use                                  |
|-----------------------|--------------------------------------|
| `aptos.woff2`         | Body text (Windows 11 / M365 default)|
| `aptos-bold.woff2`    | Bold weight                          |
| `aptos-italic.woff2`  | Italic                               |

The system-font fallback stack (`Segoe UI → Roboto → Helvetica Neue → Arial`)
works out of the box with no files placed here.

## Sourcing Aptos legally
Aptos ships with Windows 11 and Microsoft 365. You can extract it from:
`C:\Windows\Fonts\aptos*.ttf` and convert to woff2 with:

```
npx ttf2woff2 aptos.ttf > aptos.woff2
```
