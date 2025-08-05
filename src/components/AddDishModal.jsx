import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// Importação de componentes da UI (shadcn)
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'

// Esquema de validação usando Zod
const formSchema = z.object({
  nome_prato: z.string().min(1, 'Nome do prato é obrigatório'),
  descricao: z.string().optional(),
  preco: z
    .number({ invalid_type_error: 'Preço é obrigatório' })
    .positive('Preço deve ser maior que zero'),
  id_categoria: z
    .number({ invalid_type_error: 'Categoria é obrigatória' })
    .int('Categoria inválida'),
  disponivel: z.boolean().default(true),
  tipo_item: z.string().optional(),
})

/**
 * Modal para adicionar um novo prato ao cardápio.
 *
 * Props:
 * - categorias: lista de categorias disponíveis (opcional)
 * - onSuccess: callback para executar após criação bem sucedida
 */
export default function AddDishModal({ categorias = [], onSuccess }) {
  const [open, setOpen] = React.useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      disponivel: true,
    },
  })

  const onSubmit = async (data) => {
    try {
      const res = await fetch('/api/cardapio/prato', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        throw new Error('Falha ao adicionar prato')
      }
      // Resetar e fechar modal
      reset()
      setOpen(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error(error)
      // TODO: exibir feedback de erro ao usuário (toast, alerta, etc.)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Adicionar prato</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo prato</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="nome_prato">Nome do prato</Label>
            <Input id="nome_prato" {...register('nome_prato')} />
            {errors.nome_prato && (
              <p className="text-red-500 text-sm">
                {errors.nome_prato.message}
              </p>
            )}
          </div>
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" {...register('descricao')} />
            {errors.descricao && (
              <p className="text-red-500 text-sm">
                {errors.descricao.message}
              </p>
            )}
          </div>
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="preco">Preço (R$)</Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              {...register('preco', { valueAsNumber: true })}
            />
            {errors.preco && (
              <p className="text-red-500 text-sm">{errors.preco.message}</p>
            )}
          </div>
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="id_categoria">Categoria</Label>
            {categorias && categorias.length > 0 ? (
              <Select
                onValueChange={(value) => setValue('id_categoria', Number(value))}
              >
                <SelectTrigger id="id_categoria">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="id_categoria"
                type="number"
                {...register('id_categoria', { valueAsNumber: true })}
              />
            )}
            {errors.id_categoria && (
              <p className="text-red-500 text-sm">
                {errors.id_categoria.message}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="disponivel"
              checked={watch('disponivel')}
              onCheckedChange={(checked) => {
                setValue('disponivel', !!checked)
              }}
            />
            <Label htmlFor="disponivel">Disponível</Label>
          </div>
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="tipo_item">Tipo de item</Label>
            <Input id="tipo_item" {...register('tipo_item')} />
            {errors.tipo_item && (
              <p className="text-red-500 text-sm">
                {errors.tipo_item.message}
              </p>
            )}
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
